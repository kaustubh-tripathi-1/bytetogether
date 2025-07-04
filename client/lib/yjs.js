import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const yDoc = new Y.Doc();
export const wsProvider = new WebsocketProvider(
    'ws://localhost:3000/yjs',
    'bytetogether',
    yDoc
);

wsProvider.on('status', (event) => {
    console.log('Connection status:', event.status);
});
