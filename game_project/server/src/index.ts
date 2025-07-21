import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './game';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

const game = new Game(io);

game.start();

app.get('/', (_, res) => {
  res.send('Chrono Battle Royale server online');
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});