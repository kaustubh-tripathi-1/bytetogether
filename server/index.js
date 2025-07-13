import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from '@y/websocket-server/utils';

if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config();
}

const ALLOWED_ORIGINS_STRING =
    process.env.ALLOWED_ORIGINS || 'http://localhost:5173';

const PORT = process.env.PORT || 3000;

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

const app = express();
const httpServer = createServer(app);

// WebSocket server instance.
// Attach it to the HTTP server and keep noServer to handle custom ws upgrade logic
const wsServer = new WebSocketServer({ noServer: true });

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

        // Handle the Yjs protocol using y-websocket-server
        setupWSConnection(wsInstance, request, { docName: room });
        console.log(`WebSocket client connected to room: ${room}`);

        wsInstance.on('close', () => {
            console.log(`WebSocket client disconnected from room: ${room}`);
        });
        wsInstance.on('error', (error) => {
            console.log(`WebSocket error in room ${room}:`, error);
        });
    });
});

httpServer.listen(PORT, () => console.log('Server running on port 3000'));

//TODO Remove these before pushing to prod
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
