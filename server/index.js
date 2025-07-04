import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
// eslint-disable-next-line import/no-unresolved
import { setupWSConnection } from '@y/websocket-server/utils';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173' },
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

app.get('/yjs/:room', (req, res) => {
    setupWSConnection(req, res, { room: req.params.room });
});

httpServer.listen(3000, () => console.log('Server running on port 3000'));
