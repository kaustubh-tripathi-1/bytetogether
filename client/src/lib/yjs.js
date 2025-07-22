import { Doc } from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const DEFAULT_ROOM_NAME = 'bytetogether';

// Get room name from URL params if 'invite=true' is present, otherwise use default
const urlParams = new URLSearchParams(window.location.search);
const initialRoom = urlParams.get('room') || DEFAULT_ROOM_NAME; // Get 'room' from URL or use default
const isProduction = import.meta.env.PROD; // Vite sets this by default
const WS_PROTOCOL = isProduction ? 'wss://' : 'ws://';
const WS_HOST = isProduction
    ? 'heroku-app-name.herokuapp.com' //TODO Replace server url after deployment
    : 'localhost:3000';

// Map to store Y.Doc instances for each file
const yDocsMap = new Map();
// Map to store WebsocketProvider instances for each file
const wsProvidersMap = new Map();

// Map to store status event listener callbacks for cleanup
const statusCallbacks = new Map();

function validateParameters(param, type, name) {
    if (typeof param !== type) {
        throw new Error(`Invalid ${name}`);
    }

    if (typeof param === 'string' && !param.length) {
        throw new Error(`${name} must be a non-empty string`);
    }
}

/**
 * Gets or creates a Y.Doc for a given fileId.
 * @param {string} fileId - Unique identifier for the file.
 * @param {string} [username=User ${yDoc.clientID}] - Username for awareness.
 * @param {boolean} isAdmin - Whether the client is room admin
 * @returns {{yDoc: Doc, yText: import('yjs').Text, wsProvider: WebsocketProvider, awareness: import('y-protocols/awareness').Awareness, clientId: number}}
 */
//TODO add room name as projectId
function getOrCreateYDoc(/* room, */ fileId, username, isAdmin) {
    validateParameters(fileId, 'string', 'fileId');
    validateParameters(username, 'string', 'username');
    validateParameters(isAdmin, 'boolean');

    if (!yDocsMap.has(fileId)) {
        const yDoc = new Doc();
        yDocsMap.set(fileId, yDoc);

        const roomName = `${/* room ||  */ initialRoom}-${fileId}`; // Unique room name per file
        const clientId = yDoc.clientID;

        const wsProvider = new WebsocketProvider(
            `${WS_PROTOCOL}${WS_HOST}/yjs`,
            roomName,
            yDoc,
            {
                connect: false,
                maxBackoffTime: 5000,
                params: {
                    room: roomName,
                    clientId: clientId.toString(),
                    username: username || `User${clientId}`,
                    admin: isAdmin,
                },
                maxRetries: 10,
                WebSocketPolyfill: WebSocket, // Ensure compatibility
            }
        );

        function onStatus(event) {
            console.log(
                `Connection status for room ${roomName}: ${event.status}`
            );
        }
        wsProvider.on('status', onStatus);

        wsProvider.awareness.setLocalStateField('user', {
            name: username || `User${clientId}`,
            clientId,
        });
        wsProvidersMap.set(fileId, wsProvider);
        statusCallbacks.set(fileId, onStatus);
    }

    const yDoc = yDocsMap.get(fileId);
    const wsProvider = wsProvidersMap.get(fileId);
    const yText = yDoc.getText('monaco'); // Use a consistent name for the text block
    const awareness = wsProvider.awareness;
    const clientId = yDoc.clientID;

    return { yDoc, yText, wsProvider, awareness, clientId };
}

/**
 * Connects the WebsocketProvider for a given fileId.
 * @param {string} fileId - The ID of the file to connect.
 */
function connectYjsForFile(fileId) {
    validateParameters(fileId, 'string', 'fileId');
    const provider = wsProvidersMap.get(fileId);
    if (provider && !provider.shouldConnect) {
        console.log(`Connecting Yjs provider for file: ${fileId}`);
        provider.connect();
    }
}

/**
 * Disconnects the WebsocketProvider for a given fileId.
 * @param {string} fileId - The ID of the file to disconnect.
 */
function disconnectYjsForFile(fileId) {
    validateParameters(fileId, 'string', 'fileId');
    const provider = wsProvidersMap.get(fileId);
    if (provider && provider.shouldConnect && provider.ws?.readyState === 1) {
        console.log(`Disconnecting Yjs provider for file: ${fileId}`);
        provider.disconnect();
    }
    const onStatus = statusCallbacks.get(fileId);
    provider.off('status', onStatus);
}

/**
 * Disconnects all Yjs providers and clears all Y.Docs.
 */
function disconnectAllYjs() {
    wsProvidersMap.forEach((provider, fileId) => {
        console.log(
            `Disconnecting all Yjs ws providers from room ${provider.roomname} with file id - ${fileId}.`
        );
        const onStatus = statusCallbacks.get(fileId);
        if (provider && provider.ws?.readyState === 1) {
            provider.off('status', onStatus);
            provider.disconnect();
            provider.destroy();
        }
    });
    yDocsMap.forEach((yDoc, fileId) => {
        console.log(
            `Destroying all Yjs yDocs from room with file id - ${fileId}.`
        );
        yDoc.destroy();
    });
    wsProvidersMap.clear();
    yDocsMap.clear();
    console.log('Cleared all Yjs documents and providers.');
}

export {
    getOrCreateYDoc,
    connectYjsForFile,
    disconnectYjsForFile,
    disconnectAllYjs,
};
