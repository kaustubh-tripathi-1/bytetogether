import { Doc } from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const DEFAULT_ROOM_NAME = 'bytetogether';

// Get room name from URL params if 'invite=true' is present, otherwise use default
const urlParams = new URLSearchParams(window.location.search);
const initialRoom = urlParams.get('room') || DEFAULT_ROOM_NAME; // Get 'room' from URL or use default
const isProduction = import.meta.env.PROD; // Vite sets this by default
const WS_PROTOCOL = isProduction ? 'wss://' : 'ws://';
const WS_HOST = isProduction
    ? 'your-heroku-app-name.herokuapp.com' //TODO Replace server url after deployment
    : 'localhost:3000';

// Map to store Y.Doc instances for each file
const yDocsMap = new Map();
// Map to store WebsocketProvider instances for each file
const wsProvidersMap = new Map();

/**
 * Gets or creates a Y.Doc for a given fileId.
 * @param {string} fileId - Unique identifier for the file (e.g., file's $id).
 * @returns {{yDoc: Doc, yText: import('yjs').Text, wsProvider: WebsocketProvider}}
 */
function getOrCreateYDoc(fileId) {
    if (!yDocsMap.has(fileId)) {
        const yDoc = new Doc();
        yDocsMap.set(fileId, yDoc);

        const roomName = `${initialRoom}-${fileId}`; // Unique room name per file

        const wsProvider = new WebsocketProvider(
            `${WS_PROTOCOL}${WS_HOST}/yjs`,
            roomName,
            yDoc,
            {
                connect: false,
                maxBackoffTime: 5000,
                params: { room: roomName },
                maxRetries: Infinity, // Prevent giving up on reconnect
                WebSocketPolyfill: WebSocket, // Ensure compatibility
            }
        );

        wsProvider.on('status', (event) => {
            console.log(
                `Connection status for room ${roomName}:`,
                event.status
            );
        });

        wsProvidersMap.set(fileId, wsProvider);
    }

    const yDoc = yDocsMap.get(fileId);
    const wsProvider = wsProvidersMap.get(fileId);
    const yText = yDoc.getText('monaco'); // Use a consistent name for the text block
    const awareness = wsProvider.awareness;

    return { yDoc, yText, wsProvider, awareness };
}

/**
 * Connects the WebsocketProvider for a given fileId.
 * @param {string} fileId - The ID of the file to connect.
 */
function connectYjsForFile(fileId) {
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
    const provider = wsProvidersMap.get(fileId);
    if (provider && provider.shouldConnect) {
        console.log(`Disconnecting Yjs provider for file: ${fileId}`);
        provider.disconnect();
    }
}

/**
 * Disconnects all Yjs providers and clears all Y.Docs.
 * This can be useful on a full application unmount or project change.
 */
function disconnectAllYjs() {
    wsProvidersMap.forEach((provider, fileId) => {
        if (provider && provider.shouldConnect) {
            console.log(
                `Disconnecting all Yjs providers from room ${provider.roomid} with file id - ${fileId}.`
            );
            provider.disconnect();
        }
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
