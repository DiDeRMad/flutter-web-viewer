import { Server as SocketServer } from 'socket.io';
import { EventEmitter } from 'events';
import { CacheService } from '../../services/cache';
import { QueueService } from '../../services/queue';
import { MonitoringService } from '../../services/monitoring';
import { Zone } from './Zone';
import { Player } from '../entities/Player';
import { WorldState } from './WorldState';
import { CombatSystem } from '../systems/CombatSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { ChatSystem } from '../systems/ChatSystem';
import { QuestSystem } from '../systems/QuestSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { SkillSystem } from '../systems/SkillSystem';
import { GuildSystem } from '../systems/GuildSystem';
import { PartySystem } from '../systems/PartySystem';
import { TradeSystem } from '../systems/TradeSystem';
import { CraftingSystem } from '../systems/CraftingSystem';
import { PvPSystem } from '../systems/PvPSystem';
import { AuctionSystem } from '../systems/AuctionSystem';
import { MailSystem } from '../systems/MailSystem';
import { AchievementSystem } from '../systems/AchievementSystem';
import { EventSystem } from '../systems/EventSystem';
import { WeatherSystem } from '../systems/WeatherSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { logger } from '../../services/logging';
import { config } from '../../config';

interface GameWorldOptions {
  io: SocketServer;
  cache: CacheService;
  queue: QueueService;
  monitoring: MonitoringService;
}

export class GameWorld extends EventEmitter {
  private io: SocketServer;
  private cache: CacheService;
  private queue: QueueService;
  private monitoring: MonitoringService;
  
  private zones: Map<string, Zone> = new Map();
  private players: Map<string, Player> = new Map();
  private worldState: WorldState;
  
  // Game Systems
  private combatSystem: CombatSystem;
  private movementSystem: MovementSystem;
  private chatSystem: ChatSystem;
  private questSystem: QuestSystem;
  private inventorySystem: InventorySystem;
  private skillSystem: SkillSystem;
  private guildSystem: GuildSystem;
  private partySystem: PartySystem;
  private tradeSystem: TradeSystem;
  private craftingSystem: CraftingSystem;
  private pvpSystem: PvPSystem;
  private auctionSystem: AuctionSystem;
  private mailSystem: MailSystem;
  private achievementSystem: AchievementSystem;
  private eventSystem: EventSystem;
  private weatherSystem: WeatherSystem;
  private economySystem: EconomySystem;
  
  private isRunning: boolean = false;
  private lastTickTime: number = 0;
  private tickRate: number;
  private saveInterval: NodeJS.Timer | null = null;

  constructor(options: GameWorldOptions) {
    super();
    this.io = options.io;
    this.cache = options.cache;
    this.queue = options.queue;
    this.monitoring = options.monitoring;
    this.tickRate = 1000 / config.game.tickRate;
    
    this.worldState = new WorldState();
    
    // Initialize systems
    this.combatSystem = new CombatSystem(this);
    this.movementSystem = new MovementSystem(this);
    this.chatSystem = new ChatSystem(this);
    this.questSystem = new QuestSystem(this);
    this.inventorySystem = new InventorySystem(this);
    this.skillSystem = new SkillSystem(this);
    this.guildSystem = new GuildSystem(this);
    this.partySystem = new PartySystem(this);
    this.tradeSystem = new TradeSystem(this);
    this.craftingSystem = new CraftingSystem(this);
    this.pvpSystem = new PvPSystem(this);
    this.auctionSystem = new AuctionSystem(this);
    this.mailSystem = new MailSystem(this);
    this.achievementSystem = new AchievementSystem(this);
    this.eventSystem = new EventSystem(this);
    this.weatherSystem = new WeatherSystem(this);
    this.economySystem = new EconomySystem(this);
  }

  async initialize(): Promise<void> {
    logger.info('Initializing game world...');
    
    // Load world data
    await this.loadWorldData();
    
    // Initialize all systems
    await Promise.all([
      this.combatSystem.initialize(),
      this.movementSystem.initialize(),
      this.chatSystem.initialize(),
      this.questSystem.initialize(),
      this.inventorySystem.initialize(),
      this.skillSystem.initialize(),
      this.guildSystem.initialize(),
      this.partySystem.initialize(),
      this.tradeSystem.initialize(),
      this.craftingSystem.initialize(),
      this.pvpSystem.initialize(),
      this.auctionSystem.initialize(),
      this.mailSystem.initialize(),
      this.achievementSystem.initialize(),
      this.eventSystem.initialize(),
      this.weatherSystem.initialize(),
      this.economySystem.initialize(),
    ]);
    
    // Setup save interval
    this.saveInterval = setInterval(() => {
      this.saveWorldState();
    }, config.game.saveInterval);
    
    this.isRunning = true;
    logger.info('Game world initialized successfully');
  }

  async loadWorldData(): Promise<void> {
    // Load zones, NPCs, items, etc. from database
    logger.info('Loading world data...');
    
    // TODO: Implement actual world data loading
    // For now, create a test zone
    const testZone = new Zone({
      id: 'zone_001',
      name: 'Starting Area',
      level: { min: 1, max: 10 },
      bounds: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 1000, y: 100, z: 1000 },
      },
    });
    
    await testZone.initialize();
    this.zones.set(testZone.id, testZone);
    
    logger.info(`Loaded ${this.zones.size} zones`);
  }

  update(deltaTime: number): void {
    if (!this.isRunning) return;
    
    // Update world state
    this.worldState.update(deltaTime);
    
    // Update all zones
    for (const zone of this.zones.values()) {
      zone.update(deltaTime);
    }
    
    // Update all systems
    this.combatSystem.update(deltaTime);
    this.movementSystem.update(deltaTime);
    this.questSystem.update(deltaTime);
    this.skillSystem.update(deltaTime);
    this.pvpSystem.update(deltaTime);
    this.weatherSystem.update(deltaTime);
    this.eventSystem.update(deltaTime);
    
    // Update all players
    for (const player of this.players.values()) {
      player.update(deltaTime);
    }
    
    // Send updates to clients
    this.sendWorldUpdates();
    
    // Update monitoring metrics
    this.monitoring.recordMetric('game.tick_time', Date.now() - this.lastTickTime);
    this.monitoring.recordMetric('game.player_count', this.players.size);
    this.monitoring.recordMetric('game.zone_count', this.zones.size);
  }

  private sendWorldUpdates(): void {
    // Send position updates, state changes, etc. to relevant clients
    for (const player of this.players.values()) {
      const updates = player.getUpdates();
      if (updates.length > 0) {
        player.socket.emit('world:updates', updates);
        player.clearUpdates();
      }
    }
  }

  async addPlayer(player: Player): Promise<void> {
    this.players.set(player.id, player);
    
    // Add player to appropriate zone
    const zone = this.zones.get(player.zoneId);
    if (zone) {
      await zone.addPlayer(player);
    }
    
    // Notify systems
    this.emit('player:join', player);
    
    logger.info(`Player ${player.name} joined the world`);
  }

  async removePlayer(playerId: string): Promise<void> {
    const player = this.players.get(playerId);
    if (!player) return;
    
    // Save player data
    await player.save();
    
    // Remove from zone
    const zone = this.zones.get(player.zoneId);
    if (zone) {
      await zone.removePlayer(playerId);
    }
    
    // Remove from party/guild/etc
    await this.partySystem.removePlayer(playerId);
    await this.guildSystem.handlePlayerOffline(playerId);
    
    // Clean up any active trades, duels, etc
    await this.tradeSystem.cancelPlayerTrades(playerId);
    await this.pvpSystem.handlePlayerDisconnect(playerId);
    
    this.players.delete(playerId);
    
    // Notify systems
    this.emit('player:leave', playerId);
    
    logger.info(`Player ${player.name} left the world`);
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getPlayerByName(name: string): Player | undefined {
    return Array.from(this.players.values()).find(p => p.name === name);
  }

  getZone(zoneId: string): Zone | undefined {
    return this.zones.get(zoneId);
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  async movePlayerToZone(playerId: string, newZoneId: string, position?: { x: number; y: number; z: number }): Promise<void> {
    const player = this.players.get(playerId);
    if (!player) return;
    
    const currentZone = this.zones.get(player.zoneId);
    const newZone = this.zones.get(newZoneId);
    
    if (!newZone) {
      logger.error(`Zone ${newZoneId} not found`);
      return;
    }
    
    // Remove from current zone
    if (currentZone && currentZone.id !== newZoneId) {
      await currentZone.removePlayer(playerId);
    }
    
    // Update player zone
    player.zoneId = newZoneId;
    if (position) {
      player.position = position;
    }
    
    // Add to new zone
    await newZone.addPlayer(player);
    
    // Notify player of zone change
    player.socket.emit('zone:changed', {
      zoneId: newZoneId,
      position: player.position,
    });
    
    logger.info(`Player ${player.name} moved to zone ${newZoneId}`);
  }

  broadcast(event: string, data: any, filter?: (player: Player) => boolean): void {
    for (const player of this.players.values()) {
      if (!filter || filter(player)) {
        player.socket.emit(event, data);
      }
    }
  }

  broadcastToZone(zoneId: string, event: string, data: any, exclude?: string[]): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.broadcast(event, data, exclude);
    }
  }

  async saveWorldState(): Promise<void> {
    try {
      logger.info('Saving world state...');
      
      // Save all player data
      const savePromises = Array.from(this.players.values()).map(player => player.save());
      await Promise.all(savePromises);
      
      // Save world state
      await this.worldState.save();
      
      // Save system states
      await Promise.all([
        this.guildSystem.saveState(),
        this.auctionSystem.saveState(),
        this.economySystem.saveState(),
        this.eventSystem.saveState(),
      ]);
      
      logger.info('World state saved successfully');
    } catch (error) {
      logger.error('Failed to save world state:', error);
    }
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down game world...');
    
    this.isRunning = false;
    
    // Clear save interval
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    // Save final state
    await this.saveWorldState();
    
    // Disconnect all players
    for (const player of this.players.values()) {
      player.socket.disconnect();
    }
    
    // Shutdown all systems
    await Promise.all([
      this.combatSystem.shutdown(),
      this.movementSystem.shutdown(),
      this.chatSystem.shutdown(),
      this.questSystem.shutdown(),
      this.inventorySystem.shutdown(),
      this.skillSystem.shutdown(),
      this.guildSystem.shutdown(),
      this.partySystem.shutdown(),
      this.tradeSystem.shutdown(),
      this.craftingSystem.shutdown(),
      this.pvpSystem.shutdown(),
      this.auctionSystem.shutdown(),
      this.mailSystem.shutdown(),
      this.achievementSystem.shutdown(),
      this.eventSystem.shutdown(),
      this.weatherSystem.shutdown(),
      this.economySystem.shutdown(),
    ]);
    
    // Shutdown all zones
    for (const zone of this.zones.values()) {
      await zone.shutdown();
    }
    
    logger.info('Game world shutdown complete');
  }

  // Getters for systems
  getCombatSystem(): CombatSystem { return this.combatSystem; }
  getMovementSystem(): MovementSystem { return this.movementSystem; }
  getChatSystem(): ChatSystem { return this.chatSystem; }
  getQuestSystem(): QuestSystem { return this.questSystem; }
  getInventorySystem(): InventorySystem { return this.inventorySystem; }
  getSkillSystem(): SkillSystem { return this.skillSystem; }
  getGuildSystem(): GuildSystem { return this.guildSystem; }
  getPartySystem(): PartySystem { return this.partySystem; }
  getTradeSystem(): TradeSystem { return this.tradeSystem; }
  getCraftingSystem(): CraftingSystem { return this.craftingSystem; }
  getPvPSystem(): PvPSystem { return this.pvpSystem; }
  getAuctionSystem(): AuctionSystem { return this.auctionSystem; }
  getMailSystem(): MailSystem { return this.mailSystem; }
  getAchievementSystem(): AchievementSystem { return this.achievementSystem; }
  getEventSystem(): EventSystem { return this.eventSystem; }
  getWeatherSystem(): WeatherSystem { return this.weatherSystem; }
  getEconomySystem(): EconomySystem { return this.economySystem; }
  
  // Service getters
  getCache(): CacheService { return this.cache; }
  getQueue(): QueueService { return this.queue; }
  getMonitoring(): MonitoringService { return this.monitoring; }
  getIO(): SocketServer { return this.io; }
}

export { GameWorld };