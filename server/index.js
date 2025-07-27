import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import {
    setupWSConnection,
    getYDoc,
    setPersistence,
    docs,
} from '@y/websocket-server/utils';
import judge0Routes from './routes/judge0.js';

if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config();
}

const ALLOWED_ORIGINS_STRING =
    process.env.ALLOWED_ORIGINS || 'http://localhost:5173';

const PORT = process.env.PORT || 3000;

const MAX_CLIENTS_PER_ROOM = 5;

const ALLOWED_ORIGINS = ALLOWED_ORIGINS_STRING.split(',').map((origin) => {
    const trimmed = origin.trim();

    // Convert wildcard to regex for vercel preview builds
    // if (trimmed.includes('*')) {
    //     // Simple conversion for *.vercel.app: replace . with \. and * with .+
    //     // Vercel preview builds origin using regex (not safe)
    //     const wildCardRegex = new RegExp(
    //         `^${trimmed.replace(/\./g, '\\.').replace(/\*/g, '.+')}$`
    //     );
    //     return wildCardRegex;
    // }

    return trimmed;
});

// Track yDocs and clients per room
const roomClients = new Map(); // room -> Map<wsInstance, { clientId: number, username: string }>
const roomAdmins = new Map(); // room -> wsInstance (admin client)

const app = express();
const httpServer = createServer(app);

// Native CORS middleware
/* app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
}); */
// Cors package middleware
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use('/api', judge0Routes); // Mount Judge0 routes

// WebSocket server instance.
// Attach it to the HTTP server and keep noServer to handle custom ws upgrade logic
const wsServer = new WebSocketServer({ noServer: true });

// Disable default persistence (not using y-indexeddb or y-leveldb)
setPersistence(null);

// Helper to safely get connected clients Map size
function getRoomClientCount(room) {
    return roomClients.get(room)?.size ?? 0;
}

// Handle WebSocket upgrade requests
httpServer.on('upgrade', (request, socket, head) => {
    // Parse the URL to determine the room
    const { pathname, searchParams } = new URL(
        request.url,
        `http://${request.headers.host}`
    );

    const clientOrigin = request.headers.origin;

    const isOriginAllowed = ALLOWED_ORIGINS.some((origin) => {
        if (typeof origin === 'string') {
            return clientOrigin === origin;
        }
        // If it's a RegExp, test it
        // return origin.test(clientOrigin);
    });

    // Check if pathname doesn't include yjs OR origin exists AND is not in allowed list
    if (!pathname.includes('/yjs') || (clientOrigin && !isOriginAllowed)) {
        console.log(
            `WebSocket upgrade rejected from origin: ${clientOrigin} for path: ${pathname}`
        );

        socket.destroy(); // Destroy the socket if not a Yjs WebSocket request or an allwoed origin
        return;
    }

    // Handle WebSocket connections on the /yjs path
    wsServer.handleUpgrade(request, socket, head, (wsInstance) => {
        // Extract room from search params or fallback to default
        const room = searchParams.get('room') || 'bytetogether'; // fallback to 'bytetogether' as the default room
        const isAdmin = searchParams.get('admin') === 'true'; // Set by client in handleInvite
        const clientId = parseInt(searchParams.get('clientId')) || 0; // Unique client ID
        const username = searchParams.get('username') || `User${clientId}`; // From awareness

        const currentClientCount = getRoomClientCount(room);
        if (currentClientCount >= MAX_CLIENTS_PER_ROOM) {
            const message = JSON.stringify({
                type: 'room-full',
                error: `Room "${room}" has reached the limit of ${MAX_CLIENTS_PER_ROOM} participants.`,
            });

            console.warn(
                `Client rejected: Room "${room}" is full (${currentClientCount}/${MAX_CLIENTS_PER_ROOM})`
            );

            wsInstance.send(message); // Inform the client why they’re unable to join
            wsInstance.close(4001, 'Room is full'); // Close with custom code (4001 = custom app limit)
            return;
        }

        // Track clients
        if (!roomClients.has(room)) {
            roomClients.set(room, new Map());
        }
        roomClients.get(room).set(wsInstance, { clientId, username });
        if (isAdmin) {
            roomAdmins.set(room, wsInstance);
        }

        // Handle the Yjs protocol using y-websocket-server
        setupWSConnection(wsInstance, request, { docName: room });
        console.log(
            `WebSocket client ${username} (ID: ${clientId}) connected to room: ${room}`
        );

        // Notify all clients of current connected users
        function notifyClients(
            sendMessage = false,
            type,
            clientId,
            username,
            message
        ) {
            try {
                if (roomClients.get(room)) {
                    const clients = [...roomClients.get(room).entries()];
                    const connectedClients = clients.map(
                        ([_, { clientId, username }]) => ({
                            clientId,
                            username,
                        })
                    );
                    roomClients.get(room).forEach((_, client) => {
                        if (
                            client !== wsInstance &&
                            client.readyState === client.OPEN
                        ) {
                            client.send(
                                JSON.stringify({
                                    type: 'client-update',
                                    connectedClients,
                                })
                            );
                        }
                    });

                    if (sendMessage) {
                        roomClients.get(room)?.forEach((_, client) => {
                            if (
                                client !== wsInstance &&
                                client.readyState === client.OPEN
                            ) {
                                client.send(
                                    JSON.stringify({
                                        type: type,
                                        clientId,
                                        username,
                                        message: message,
                                    })
                                );
                            }
                        });
                    }
                }
            } catch (error) {
                console.error(`Error in notifying clients :`, error);
            }
        }

        wsInstance.on('message', (data, isBinary) => {
            if (isBinary || data instanceof ArrayBuffer) return;
            try {
                const message = JSON.parse(data);
                if (
                    message.type === 'end-room' &&
                    isAdmin &&
                    roomAdmins.get(room) === wsInstance
                ) {
                    // Destroy yDoc and disconnect all clients
                    const yDoc = getYDoc(room);
                    yDoc.destroy();
                    docs.delete(room);
                    roomClients.get(room).forEach((_, client) => {
                        if (
                            client !== wsInstance &&
                            client.readyState === client.OPEN
                        ) {
                            client.send(
                                JSON.stringify({
                                    type: 'room-ended',
                                    message: `Room has been closed by the admin ${username}`,
                                })
                            );
                            client.close();
                        }
                    });
                    roomClients.delete(room);
                    roomAdmins.delete(room);
                    console.log(`Room ${room} destroyed by admin`);
                } else if (message.type === 'client-left') {
                    roomClients.get(room).delete(wsInstance);
                } else if (message.type === 'client-joined') {
                    const { clientId, username } = message;
                    notifyClients(
                        true,
                        'client-joined',
                        clientId,
                        username,
                        `${username} joined the room`
                    );
                }
            } catch (error) {
                console.error(
                    `Error processing message in room ${room}:`,
                    error
                );
            }
        });

        wsInstance.on('close', () => {
            console.log(
                `WebSocket client ${username} (ID: ${clientId}) disconnected from room: ${room}`
            );
            try {
                const roomMap = roomClients.get(room);
                if (roomMap) {
                    notifyClients(
                        true,
                        'client-left',
                        clientId,
                        username,
                        `${username} left the room`
                    );
                    roomMap?.delete(wsInstance);
                }
                if (roomAdmins.get(room) === wsInstance) {
                    roomAdmins.delete(room);
                }

                if (getRoomClientCount(room) === 0) {
                    const yDoc = getYDoc(room);
                    yDoc.destroy();
                    roomClients.delete(room);
                    docs.delete(room);
                    console.log(`Room ${room} destroyed (no clients left)`);
                }
            } catch (error) {
                console.error(`Error in ws close event :`, error);
            }
        });

        wsInstance.on('error', (error) => {
            console.log(`WebSocket error in room ${room}:`, error);
        });

        // Initial notification of connected clients
        notifyClients(false);
    });
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//TODO Remove these before pushing to prod
wsServer.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
