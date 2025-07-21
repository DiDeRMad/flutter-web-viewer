import { Server, Socket } from 'socket.io';

interface Player {
  id: string;
  x: number;
  y: number;
  hp: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerId: string;
}

export class Game {
  private io: Server;
  private players: Map<string, Player> = new Map();
  private bullets: Map<number, Bullet> = new Map();
  private bulletCounter = 0;
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
    const player: Player = { id: socket.id, x: 400, y: 300, hp: 100 };
    this.players.set(socket.id, player);

    // Send initial state to the connecting client
    socket.emit('init', {
      id: socket.id,
      players: Array.from(this.players.values()),
      bullets: Array.from(this.bullets.values())
    });
    socket.broadcast.emit('player_join', player);

    // Handle movement updates from client
    socket.on('move', (data: { x: number; y: number }) => {
      const p = this.players.get(socket.id);
      if (p) {
        p.x = data.x;
        p.y = data.y;
      }
    });

    // Handle shooting
    socket.on('shoot', (data: { targetX: number; targetY: number }) => {
      const p = this.players.get(socket.id);
      if (!p) return;
      const dx = data.targetX - p.x;
      const dy = data.targetY - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const speed = 400; // units per second
      const vx = (dx / len) * speed;
      const vy = (dy / len) * speed;
      const bullet: Bullet = {
        id: ++this.bulletCounter,
        x: p.x,
        y: p.y,
        vx,
        vy,
        ownerId: socket.id
      };
      this.bullets.set(bullet.id, bullet);
    });

    socket.on('disconnect', () => {
      this.players.delete(socket.id);
      socket.broadcast.emit('player_leave', { id: socket.id });
    });
  }

  private tick() {
    const delta = 0.05; // 50ms in seconds

    // Update bullets
    this.bullets.forEach((b) => {
      b.x += b.vx * delta;
      b.y += b.vy * delta;

      // Remove if out of bounds
      if (b.x < 0 || b.x > 800 || b.y < 0 || b.y > 600) {
        this.bullets.delete(b.id);
        return;
      }

      // Collision with players
      this.players.forEach((pl) => {
        if (pl.id === b.ownerId || pl.hp <= 0) return;
        const dist = Math.hypot(pl.x - b.x, pl.y - b.y);
        if (dist < 15) {
          pl.hp -= 25;
          this.bullets.delete(b.id);
          if (pl.hp <= 0) {
            // Respawn
            pl.hp = 100;
            pl.x = Math.random() * 800;
            pl.y = Math.random() * 600;
          }
        }
      });
    });

    // Broadcast authoritative state to all clients
    this.io.emit('state', {
      players: Array.from(this.players.values()),
      bullets: Array.from(this.bullets.values())
    });
  }
}