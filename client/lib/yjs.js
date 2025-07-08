import { Doc } from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const yDoc = new Doc();
const yText = yDoc.getText('monaco'); // 'monaco' is the name of our shared text block

const DEFAULT_ROOM_NAME = 'bytetogether';

// Get room name from URL path instead of searchParams if 'invite=true' is present
// const urlPathSegments = window.location.pathname.split('/');
// const currentRoom = urlPathSegments[urlPathSegments.length - 1]; // Assumes projectId is last segment

// Get room name from URL params if 'invite=true' is present, otherwise use default
const urlParams = new URLSearchParams(window.location.search);
const invited = urlParams.get('invite') === 'true';
const currentRoom = urlParams.get('room') || DEFAULT_ROOM_NAME; // Get 'room' from URL or use default
const isProduction = import.meta.env.PROD; // Vite sets this by default
const WS_PROTOCOL = isProduction ? 'wss://' : 'ws://';
//TODO Replace server url after deployment
const WS_HOST = isProduction
    ? 'your-heroku-app-name.herokuapp.com'
    : 'localhost:3000';

const wsProvider = new WebsocketProvider(
    //TODO Upgrade server url to wss after deployment
    `${WS_PROTOCOL}${WS_HOST}/yjs`,
    currentRoom,
    yDoc,
    {
        connect: false, // Disable auto-connect
        maxBackoffTime: 5000, // Max reconnect delay 5 seconds
        params: { room: currentRoom },
    }
);

// Awareness for collaborative cursors
const awareness = wsProvider.awareness;

wsProvider.on('status', (event) => {
    console.log('Connection status:', event.status, '\nfor room:', currentRoom);
});

// Connect if invited via URL param
if (invited) {
    console.log('Connecting via invite link to room:', currentRoom);
    wsProvider.connect();
}

function connectYjs(room = DEFAULT_ROOM_NAME) {
    if (!wsProvider.shouldConnect) {
        console.log('Explicitly connecting Yjs provider to room:', room);
        wsProvider.connect();
    }
}

function disconnectYjs() {
    if (wsProvider.shouldConnect) {
        console.log('Disconnecting Yjs provider.');
        wsProvider.disconnect();
    }
}

export { yText, yDoc, wsProvider, connectYjs, disconnectYjs, awareness };
