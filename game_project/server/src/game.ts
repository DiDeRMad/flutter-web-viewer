import { Server, Socket } from 'socket.io';

interface Player {
  id: string;
  x: number;
  y: number;
}

export class Game {
  private io: Server;
  private players: Map<string, Player> = new Map();
  private tickInterval?: NodeJS.Timeout;

  constructor(io: Server) {
    this.io = io;
    this.io.on('connection', (socket) => this.handleConnection(socket));
  }

  start() {
    // 20 ticks per second
    this.tickInterval = setInterval(() => this.tick(), 50);
  }

  stop() {
    if (this.tickInterval) clearInterval(this.tickInterval);
  }

  private handleConnection(socket: Socket) {
    const player: Player = { id: socket.id, x: 400, y: 300 };
    this.players.set(socket.id, player);

    // Send initial state to the connecting client
    socket.emit('init', { id: socket.id, players: Array.from(this.players.values()) });
    socket.broadcast.emit('player_join', player);

    // Handle movement updates from client
    socket.on('move', (data: { x: number; y: number }) => {
      const p = this.players.get(socket.id);
      if (p) {
        p.x = data.x;
        p.y = data.y;
      }
    });

    socket.on('disconnect', () => {
      this.players.delete(socket.id);
      socket.broadcast.emit('player_leave', { id: socket.id });
    });
  }

  private tick() {
    // Broadcast authoritative state to all clients
    this.io.emit('state', Array.from(this.players.values()));
  }
}