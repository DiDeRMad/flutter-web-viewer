import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameMatch, 
  MatchPlayer, 
  Position, 
  GameMode, 
  MatchStatus, 
  CharacterClass,
  MatchEvent,
  EventType,
  WebSocketMessageType
} from '@/types';
import { gameLogger, gameEventLogger, performanceLogger } from '@/utils/logger';
import config from '@/config';
import { Match } from './match';
import { Physics } from './physics';
import { CombatSystem } from './combat';
import { SkillSystem } from './skills';
import { ItemSystem } from './items';
import { MapManager } from './maps';

interface GameEngineEvents {
  'match:created': (match: GameMatch) => void;
  'match:started': (match: GameMatch) => void;
  'match:ended': (match: GameMatch) => void;
  'match:player_joined': (matchId: string, player: MatchPlayer) => void;
  'match:player_left': (matchId: string, playerId: string) => void;
  'player:killed': (matchId: string, killerId: string, victimId: string) => void;
  'player:respawned': (matchId: string, playerId: string) => void;
  'achievement:unlocked': (playerId: string, achievementId: string) => void;
}

export declare interface GameEngine {
  on<U extends keyof GameEngineEvents>(event: U, listener: GameEngineEvents[U]): this;
  emit<U extends keyof GameEngineEvents>(event: U, ...args: Parameters<GameEngineEvents[U]>): boolean;
}

export class GameEngine extends EventEmitter {
  private matches: Map<string, Match> = new Map();
  private playerMatches: Map<string, string> = new Map(); // playerId -> matchId
  private tickInterval: NodeJS.Timeout | null = null;
  private lastTick: number = 0;
  private tickRate: number = config.game.tickRate;
  private isRunning: boolean = false;

  // Game systems
  private physics: Physics;
  private combatSystem: CombatSystem;
  private skillSystem: SkillSystem;
  private itemSystem: ItemSystem;
  private mapManager: MapManager;

  // Performance tracking
  private tickTimes: number[] = [];
  private avgTickTime: number = 0;
  private maxTickTime: number = 0;

  constructor() {
    super();
    this.physics = new Physics();
    this.combatSystem = new CombatSystem();
    this.skillSystem = new SkillSystem();
    this.itemSystem = new ItemSystem();
    this.mapManager = new MapManager();
  }

  async initialize(): Promise<void> {
    gameLogger.info('Initializing Game Engine...');
    
    try {
      // Initialize game systems
      await this.physics.initialize();
      await this.combatSystem.initialize();
      await this.skillSystem.initialize();
      await this.itemSystem.initialize();
      await this.mapManager.initialize();

      // Start the main game loop
      this.startGameLoop();
      
      this.isRunning = true;
      gameLogger.info('Game Engine initialized successfully');
    } catch (error) {
      gameLogger.error('Failed to initialize Game Engine', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    gameLogger.info('Shutting down Game Engine...');
    
    this.isRunning = false;
    
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    // End all active matches
    for (const [matchId, match] of this.matches) {
      await this.endMatch(matchId, 'server_shutdown');
    }

    this.matches.clear();
    this.playerMatches.clear();
    
    gameLogger.info('Game Engine shutdown complete');
  }

  private startGameLoop(): void {
    const tickIntervalMs = 1000 / this.tickRate;
    this.lastTick = Date.now();
    
    this.tickInterval = setInterval(() => {
      this.tick();
    }, tickIntervalMs);
    
    gameLogger.info(`Game loop started with ${this.tickRate} ticks per second`);
  }

  private tick(): void {
    const tickStart = Date.now();
    const deltaTime = tickStart - this.lastTick;
    this.lastTick = tickStart;

    try {
      // Update all active matches
      for (const [matchId, match] of this.matches) {
        if (match.getStatus() === MatchStatus.IN_PROGRESS) {
          match.update(deltaTime);
        }
      }

      // Update physics simulation
      this.physics.update(deltaTime);

      // Clean up finished matches
      this.cleanupFinishedMatches();

      // Performance tracking
      const tickDuration = Date.now() - tickStart;
      this.updatePerformanceMetrics(tickDuration);
      
    } catch (error) {
      gameLogger.error('Error in game tick', { error: error.message, stack: error.stack });
    }
  }

  private updatePerformanceMetrics(tickDuration: number): void {
    this.tickTimes.push(tickDuration);
    
    // Keep only last 100 tick times for rolling average
    if (this.tickTimes.length > 100) {
      this.tickTimes.shift();
    }
    
    this.avgTickTime = this.tickTimes.reduce((a, b) => a + b, 0) / this.tickTimes.length;
    this.maxTickTime = Math.max(this.maxTickTime, tickDuration);
    
    // Log performance warnings
    if (tickDuration > 50) { // Warn if tick takes more than 50ms
      gameLogger.warn('Slow tick detected', {
        duration: tickDuration,
        avgTickTime: this.avgTickTime,
        activeMatches: this.matches.size,
      });
    }
  }

  private cleanupFinishedMatches(): void {
    for (const [matchId, match] of this.matches) {
      if (match.getStatus() === MatchStatus.FINISHED && 
          Date.now() - match.getEndTime()!.getTime() > 60000) { // Clean up after 1 minute
        this.matches.delete(matchId);
        
        // Remove player associations
        for (const [playerId, playerMatchId] of this.playerMatches) {
          if (playerMatchId === matchId) {
            this.playerMatches.delete(playerId);
          }
        }
        
        gameLogger.debug('Cleaned up finished match', { matchId });
      }
    }
  }

  // Match management
  async createMatch(gameMode: GameMode, mapId: string, maxPlayers: number = 100): Promise<string> {
    const matchId = uuidv4();
    const map = await this.mapManager.getMap(mapId);
    
    if (!map) {
      throw new Error(`Map not found: ${mapId}`);
    }

    const match = new Match({
      id: matchId,
      type: gameMode,
      status: MatchStatus.WAITING,
      players: [],
      maxPlayers,
      currentPlayers: 0,
      map,
      settings: {
        timeLimit: config.game.matchDuration,
        scoreLimit: gameMode === GameMode.TEAM_DEATHMATCH ? 50 : 100,
        friendly_fire: false,
        respawnTime: 5,
        startingEquipment: ['basic_sword', 'basic_armor'],
        allowedClasses: Object.values(CharacterClass),
        pvpEnabled: true,
        spectatingAllowed: true,
        chatEnabled: true,
      },
      startTime: undefined,
      endTime: undefined,
      duration: 0,
      winner: undefined,
      spectators: [],
      events: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }, this.physics, this.combatSystem, this.skillSystem, this.itemSystem);

    await match.initialize();
    this.matches.set(matchId, match);

    // Set up match event listeners
    match.on('player:killed', (killerId: string, victimId: string, method: string) => {
      this.emit('player:killed', matchId, killerId, victimId);
      this.handlePlayerKilled(matchId, killerId, victimId, method);
    });

    match.on('player:respawned', (playerId: string) => {
      this.emit('player:respawned', matchId, playerId);
    });

    match.on('match:ended', (winner: string | string[]) => {
      this.emit('match:ended', match.getData());
      this.handleMatchEnded(matchId, winner);
    });

    this.emit('match:created', match.getData());
    
    gameEventLogger.matchStart(matchId, gameMode, 0);
    gameLogger.info('Match created', { matchId, gameMode, mapId, maxPlayers });
    
    return matchId;
  }

  async joinMatch(matchId: string, playerId: string, playerData: Partial<MatchPlayer>): Promise<boolean> {
    const match = this.matches.get(matchId);
    if (!match) {
      throw new Error(`Match not found: ${matchId}`);
    }

    // Check if player is already in a match
    if (this.playerMatches.has(playerId)) {
      const currentMatchId = this.playerMatches.get(playerId)!;
      if (currentMatchId !== matchId) {
        await this.leaveMatch(currentMatchId, playerId);
      } else {
        return false; // Already in this match
      }
    }

    const player: MatchPlayer = {
      playerId,
      username: playerData.username || `Player${playerId.slice(0, 8)}`,
      characterClass: playerData.characterClass || CharacterClass.WARRIOR,
      level: playerData.level || 1,
      team: playerData.team,
      position: match.getSpawnPosition(),
      health: 100,
      mana: 100,
      stamina: 100,
      isAlive: true,
      kills: 0,
      deaths: 0,
      assists: 0,
      score: 0,
      damage: 0,
      healing: 0,
      joinedAt: new Date(),
      leftAt: undefined,
      isReady: false,
      ping: 0,
      isBot: false,
    };

    const joined = await match.addPlayer(player);
    if (joined) {
      this.playerMatches.set(playerId, matchId);
      this.emit('match:player_joined', matchId, player);
      
      gameLogger.info('Player joined match', { matchId, playerId, username: player.username });
      
      // Auto-start match if enough players
      if (match.getCurrentPlayerCount() >= match.getMinPlayersToStart()) {
        await this.startMatch(matchId);
      }
    }

    return joined;
  }

  async leaveMatch(matchId: string, playerId: string): Promise<boolean> {
    const match = this.matches.get(matchId);
    if (!match) {
      return false;
    }

    const left = await match.removePlayer(playerId);
    if (left) {
      this.playerMatches.delete(playerId);
      this.emit('match:player_left', matchId, playerId);
      
      gameLogger.info('Player left match', { matchId, playerId });
      
      // End match if no players left
      if (match.getCurrentPlayerCount() === 0) {
        await this.endMatch(matchId, 'no_players');
      }
    }

    return left;
  }

  async startMatch(matchId: string): Promise<boolean> {
    const match = this.matches.get(matchId);
    if (!match) {
      return false;
    }

    const started = await match.start();
    if (started) {
      this.emit('match:started', match.getData());
      
      const playerCount = match.getCurrentPlayerCount();
      gameEventLogger.matchStart(matchId, match.getData().type, playerCount);
      gameLogger.info('Match started', { matchId, playerCount });
    }

    return started;
  }

  async endMatch(matchId: string, reason: string = 'completed'): Promise<boolean> {
    const match = this.matches.get(matchId);
    if (!match) {
      return false;
    }

    const matchData = match.getData();
    const ended = await match.end(reason);
    
    if (ended) {
      // Remove all player associations
      for (const player of matchData.players) {
        this.playerMatches.delete(player.playerId);
      }

      this.emit('match:ended', matchData);
      
      const duration = matchData.endTime!.getTime() - matchData.startTime!.getTime();
      gameEventLogger.matchEnd(matchId, duration, matchData.winner?.toString() || 'none');
      gameLogger.info('Match ended', { matchId, reason, duration, winner: matchData.winner });
    }

    return ended;
  }

  // Player actions
  async movePlayer(matchId: string, playerId: string, position: Position): Promise<boolean> {
    const match = this.matches.get(matchId);
    if (!match) {
      return false;
    }

    return await match.movePlayer(playerId, position);
  }

  async playerAttack(matchId: string, attackerId: string, targetId: string): Promise<boolean> {
    const match = this.matches.get(matchId);
    if (!match) {
      return false;
    }

    return await match.playerAttack(attackerId, targetId);
  }

  async playerCastSpell(matchId: string, playerId: string, spellId: string, targetPosition?: Position, targetId?: string): Promise<boolean> {
    const match = this.matches.get(matchId);
    if (!match) {
      return false;
    }

    return await match.playerCastSpell(playerId, spellId, targetPosition, targetId);
  }

  async playerUseItem(matchId: string, playerId: string, itemId: string): Promise<boolean> {
    const match = this.matches.get(matchId);
    if (!match) {
      return false;
    }

    return await match.playerUseItem(playerId, itemId);
  }

  // Event handlers
  private async handlePlayerKilled(matchId: string, killerId: string, victimId: string, method: string): Promise<void> {
    const match = this.matches.get(matchId);
    if (!match) {
      return;
    }

    // Award experience and rewards to killer
    // Check for achievements
    // Update statistics
    
    gameEventLogger.playerAction(killerId, 'kill', matchId, { victimId, method });
    gameEventLogger.playerAction(victimId, 'death', matchId, { killerId, method });
  }

  private async handleMatchEnded(matchId: string, winner: string | string[]): Promise<void> {
    const match = this.matches.get(matchId);
    if (!match) {
      return;
    }

    // Award match rewards
    // Update player statistics
    // Check for achievements
    // Save match results to database
  }

  // Getters
  getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  getPlayerMatch(playerId: string): string | undefined {
    return this.playerMatches.get(playerId);
  }

  getActiveMatchesCount(): number {
    return Array.from(this.matches.values()).filter(
      match => match.getStatus() === MatchStatus.IN_PROGRESS
    ).length;
  }

  getAllMatches(): GameMatch[] {
    return Array.from(this.matches.values()).map(match => match.getData());
  }

  getMatchesByGameMode(gameMode: GameMode): GameMatch[] {
    return Array.from(this.matches.values())
      .filter(match => match.getData().type === gameMode)
      .map(match => match.getData());
  }

  // Performance metrics
  getPerformanceMetrics() {
    return {
      tickRate: this.tickRate,
      avgTickTime: this.avgTickTime,
      maxTickTime: this.maxTickTime,
      activeMatches: this.getActiveMatchesCount(),
      totalMatches: this.matches.size,
      activePlayers: this.playerMatches.size,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }

  // Health check
  isHealthy(): boolean {
    return this.isRunning && this.avgTickTime < 30; // Consider healthy if avg tick time < 30ms
  }
}