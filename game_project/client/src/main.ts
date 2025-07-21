import Phaser from 'phaser';
import { io } from 'socket.io-client';

type PlayerState = { id: string; x: number; y: number; hp: number };
type BulletState = { id: number; x: number; y: number };

type PlayerSprite = Phaser.GameObjects.Rectangle & { id: string };

const socket = io('http://localhost:3000');

class BattleScene extends Phaser.Scene {
  private players: Map<string, PlayerSprite> = new Map();
  private bullets: Map<number, Phaser.GameObjects.Ellipse> = new Map();

  constructor() {
    super('battle');
  }

  create() {
    socket.on('init', (data: { id: string; players: PlayerState[]; bullets: BulletState[] }) => {
      data.players.forEach((p) => this.addPlayer(p));
      data.bullets.forEach((b) => this.addBullet(b));
    });

    socket.on('player_join', (p: PlayerState) => this.addPlayer(p));
    socket.on('player_leave', (p: { id: string }) => {
      const sprite = this.players.get(p.id);
      if (sprite) {
        sprite.destroy();
        this.players.delete(p.id);
      }
    });

    socket.on('state', (state: { players: PlayerState[]; bullets: BulletState[] }) => {
      // Update players
      state.players.forEach((p) => {
        const sprite = this.players.get(p.id);
        if (sprite) {
          sprite.setPosition(p.x, p.y);
          // Tint based on HP
          const ratio = p.hp / 100;
          const r = Math.floor(255 * (1 - ratio));
          const g = Math.floor(255 * ratio);
          sprite.fillColor = Phaser.Display.Color.GetColor(r, g, 0);
        }
      });

      // Update bullets
      const seen = new Set<number>();
      state.bullets.forEach((b) => {
        seen.add(b.id);
        let bulletSprite = this.bullets.get(b.id);
        if (!bulletSprite) {
          bulletSprite = this.add.ellipse(b.x, b.y, 6, 6, 0xffff00) as Phaser.GameObjects.Ellipse;
          this.bullets.set(b.id, bulletSprite);
        } else {
          bulletSprite.setPosition(b.x, b.y);
        }
      });

      // Remove bullets not in state
      this.bullets.forEach((sprite, id) => {
        if (!seen.has(id)) {
          sprite.destroy();
          this.bullets.delete(id);
        }
      });
    });

    // Send pointer position as movement intent
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      socket.emit('move', { x: pointer.worldX, y: pointer.worldY });
    });

    // Shooting on pointer down
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      socket.emit('shoot', { targetX: pointer.worldX, targetY: pointer.worldY });
    });
  }

  private addPlayer(p: PlayerState) {
    const sprite = this.add.rectangle(p.x, p.y, 20, 20, 0x00ff00) as PlayerSprite;
    sprite.id = p.id;
    this.players.set(p.id, sprite);
  }

  private addBullet(b: BulletState) {
    const spr = this.add.ellipse(b.x, b.y, 6, 6, 0xffff00) as Phaser.GameObjects.Ellipse;
    this.bullets.set(b.id, spr);
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