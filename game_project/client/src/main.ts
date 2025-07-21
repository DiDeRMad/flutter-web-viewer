import Phaser from 'phaser';
import { io } from 'socket.io-client';

type PlayerState = { id: string; x: number; y: number };

type PlayerSprite = Phaser.GameObjects.Rectangle & { id: string };

const socket = io('http://localhost:3000');

class BattleScene extends Phaser.Scene {
  private players: Map<string, PlayerSprite> = new Map();

  constructor() {
    super('battle');
  }

  create() {
    socket.on('init', (data: { id: string; players: PlayerState[] }) => {
      data.players.forEach((p) => this.addPlayer(p));
    });

    socket.on('player_join', (p: PlayerState) => this.addPlayer(p));
    socket.on('player_leave', (p: { id: string }) => {
      const sprite = this.players.get(p.id);
      if (sprite) {
        sprite.destroy();
        this.players.delete(p.id);
      }
    });

    socket.on('state', (state: PlayerState[]) => {
      state.forEach((p) => {
        const sprite = this.players.get(p.id);
        if (sprite) {
          sprite.setPosition(p.x, p.y);
        }
      });
    });

    // Send pointer position as movement intent
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      socket.emit('move', { x: pointer.worldX, y: pointer.worldY });
    });
  }

  private addPlayer(p: PlayerState) {
    const sprite = this.add.rectangle(p.x, p.y, 20, 20, 0x00ff00) as PlayerSprite;
    sprite.id = p.id;
    this.players.set(p.id, sprite);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [BattleScene],
  physics: {
    default: 'arcade'
  }
};

new Phaser.Game(config);