import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameMatch, 
  MatchPlayer, 
  Position, 
  MatchStatus, 
  MatchEvent, 
  EventType,
  GameMode,
  CharacterClass,
  MapObjective,
  MapResource,
  MapHazard
} from '@/types';
import { gameLogger, gameEventLogger } from '@/utils/logger';
import { Physics } from './physics';
import { CombatSystem } from './combat';
import { SkillSystem } from './skills';
import { ItemSystem } from './items';
import { AIBotManager } from './ai/botManager';
import { SpectatorManager } from './spectator';
import { ReplaySystem } from './replay';
import { AntiCheatValidator } from './antiCheat';

interface MatchEvents {
  'player:joined': (player: MatchPlayer) => void;
  'player:left': (playerId: string) => void;
  'player:killed': (killerId: string, victimId: string, method: string) => void;
  'player:respawned': (playerId: string) => void;
  'player:moved': (playerId: string, position: Position) => void;
  'player:attacked': (attackerId: string, targetId: string, damage: number) => void;
  'player:spell_cast': (playerId: string, spellId: string, targetPosition?: Position) => void;
  'objective:captured': (objectiveId: string, teamId?: number, playerId?: string) => void;
  'resource:collected': (resourceId: string, playerId: string) => void;
  'match:started': () => void;
  'match:ended': (winner: string | string[]) => void;
  'match:state_changed': (state: MatchStatus) => void;
  'chat:message': (senderId: string, message: string, type: string) => void;
}

export declare interface Match {
  on<U extends keyof MatchEvents>(event: U, listener: MatchEvents[U]): this;
  emit<U extends keyof MatchEvents>(event: U, ...args: Parameters<MatchEvents[U]>): boolean;
}

export class Match extends EventEmitter {
  private data: GameMatch;
  private players: Map<string, MatchPlayer> = new Map();
  private spectators: Map<string, any> = new Map();
  private objectives: Map<string, MapObjective> = new Map();
  private resources: Map<string, MapResource> = new Map();
  private hazards: Map<string, MapHazard> = new Map();
  
  // Game systems
  private physics: Physics;
  private combatSystem: CombatSystem;
  private skillSystem: SkillSystem;
  private itemSystem: ItemSystem;
  private aiManager: AIBotManager;
  private spectatorManager: SpectatorManager;
  private replaySystem: ReplaySystem;
  private antiCheat: AntiCheatValidator;
  
  // Match state
  private isRunning: boolean = false;
  private startTime?: Date;
  private endTime?: Date;
  private lastUpdate: number = 0;
  private matchTimer: number = 0;
  private score: Map<number, number> = new Map(); // team -> score
  private killFeed: Array<{killerId: string, victimId: string, method: string, timestamp: Date}> = [];
  
  // Performance tracking
  private updateCount: number = 0;
  private averageUpdateTime: number = 0;
  private playerActionCounts: Map<string, number> = new Map();
  
  constructor(
    matchData: GameMatch,
    physics: Physics,
    combatSystem: CombatSystem,
    skillSystem: SkillSystem,
    itemSystem: ItemSystem
  ) {
    super();
    this.data = matchData;
    this.physics = physics;
    this.combatSystem = combatSystem;
    this.skillSystem = skillSystem;
    this.itemSystem = itemSystem;
    
    this.aiManager = new AIBotManager(this);
    this.spectatorManager = new SpectatorManager(this);
    this.replaySystem = new ReplaySystem(this);
    this.antiCheat = new AntiCheatValidator(this);
    
    this.initializeMapElements();
  }

  async initialize(): Promise<void> {
    try {
      gameLogger.info('Initializing match', { matchId: this.data.id, gameMode: this.data.type });
      
      // Initialize game systems for this match
      await this.physics.initializeForMatch(this.data.id, this.data.map);
      await this.combatSystem.initializeForMatch(this.data.id);
      await this.skillSystem.initializeForMatch(this.data.id);
      await this.itemSystem.initializeForMatch(this.data.id);
      
      // Initialize AI and other systems
      await this.aiManager.initialize();
      await this.spectatorManager.initialize();
      await this.replaySystem.initialize();
      await this.antiCheat.initialize();
      
      // Set up event listeners
      this.setupEventListeners();
      
      gameLogger.info('Match initialized successfully', { matchId: this.data.id });
    } catch (error) {
      gameLogger.error('Failed to initialize match', { 
        matchId: this.data.id, 
        error: error.message 
      });
      throw error;
    }
  }

  private initializeMapElements(): void {
    // Initialize objectives
    this.data.map.objectives.forEach(objective => {
      this.objectives.set(objective.id, {
        ...objective,
        isActive: true
      });
    });
    
    // Initialize resources
    this.data.map.resources.forEach(resource => {
      this.resources.set(resource.id, {
        ...resource,
        isAvailable: true
      });
    });
    
    // Initialize hazards
    this.data.map.hazards.forEach(hazard => {
      this.hazards.set(hazard.id, {
        ...hazard,
        isActive: true
      });
    });
  }

  private setupEventListeners(): void {
    // Combat system events
    this.combatSystem.on('player:damaged', (attackerId: string, victimId: string, damage: number) => {
      this.handlePlayerDamaged(attackerId, victimId, damage);
    });
    
    this.combatSystem.on('player:killed', (killerId: string, victimId: string, method: string) => {
      this.handlePlayerKilled(killerId, victimId, method);
    });
    
    // Physics events
    this.physics.on('collision', (entity1: string, entity2: string, force: number) => {
      this.handleCollision(entity1, entity2, force);
    });
    
    // Skill system events
    this.skillSystem.on('spell:cast', (playerId: string, spellId: string, target?: any) => {
      this.handleSpellCast(playerId, spellId, target);
    });
    
    // AI events
    this.aiManager.on('bot:action', (botId: string, action: string, data: any) => {
      this.handleBotAction(botId, action, data);
    });
  }

  async addPlayer(player: MatchPlayer): Promise<boolean> {
    if (this.data.status !== MatchStatus.WAITING) {
      return false;
    }
    
    if (this.players.size >= this.data.maxPlayers) {
      return false;
    }
    
    // Anti-cheat validation
    const isValid = await this.antiCheat.validatePlayer(player);
    if (!isValid) {
      gameLogger.warn('Player failed anti-cheat validation', { 
        playerId: player.playerId, 
        matchId: this.data.id 
      });
      return false;
    }
    
    this.players.set(player.playerId, player);
    this.data.players.push(player);
    this.data.currentPlayers = this.players.size;
    this.data.updatedAt = new Date();
    
    // Initialize player in physics system
    await this.physics.addPlayer(player.playerId, player.position);
    
    // Initialize player action tracking
    this.playerActionCounts.set(player.playerId, 0);
    
    // Add player to replay system
    this.replaySystem.recordPlayerJoin(player);
    
    this.emit('player:joined', player);
    this.addEvent(EventType.PLAYER_JOINED, player.playerId, undefined, { 
      username: player.username,
      characterClass: player.characterClass,
      level: player.level
    });
    
    gameLogger.info('Player added to match', { 
      playerId: player.playerId, 
      matchId: this.data.id,
      playerCount: this.players.size
    });
    
    return true;
  }

  async removePlayer(playerId: string): Promise<boolean> {
    const player = this.players.get(playerId);
    if (!player) {
      return false;
    }
    
    this.players.delete(playerId);
    this.data.players = this.data.players.filter(p => p.playerId !== playerId);
    this.data.currentPlayers = this.players.size;
    this.data.updatedAt = new Date();
    
    // Remove from physics
    await this.physics.removePlayer(playerId);
    
    // Clean up tracking
    this.playerActionCounts.delete(playerId);
    
    // Record in replay
    this.replaySystem.recordPlayerLeave(playerId);
    
    this.emit('player:left', playerId);
    this.addEvent(EventType.PLAYER_LEFT, playerId, undefined, { 
      reason: 'disconnect'
    });
    
    gameLogger.info('Player removed from match', { 
      playerId, 
      matchId: this.data.id,
      playerCount: this.players.size
    });
    
    return true;
  }

  async start(): Promise<boolean> {
    if (this.data.status !== MatchStatus.WAITING) {
      return false;
    }
    
    if (this.players.size < this.getMinPlayersToStart()) {
      return false;
    }
    
    this.data.status = MatchStatus.STARTING;
    this.data.updatedAt = new Date();
    
    gameLogger.info('Starting match countdown', { 
      matchId: this.data.id,
      playerCount: this.players.size
    });
    
    // 10 second countdown
    setTimeout(async () => {
      await this.actuallyStartMatch();
    }, 10000);
    
    return true;
  }

  private async actuallyStartMatch(): Promise<void> {
    this.data.status = MatchStatus.IN_PROGRESS;
    this.data.startTime = new Date();
    this.data.updatedAt = new Date();
    this.startTime = this.data.startTime;
    this.isRunning = true;
    this.lastUpdate = Date.now();
    
    // Initialize team scores if team-based mode
    if (this.isTeamBasedMode()) {
      this.score.set(1, 0);
      this.score.set(2, 0);
    }
    
    // Add AI bots if needed
    await this.addAIBotsIfNeeded();
    
    // Start game-specific logic
    await this.startGameModeSpecificLogic();
    
    this.emit('match:started');
    this.addEvent(EventType.MATCH_STARTED, undefined, undefined, {
      gameMode: this.data.type,
      playerCount: this.players.size,
      mapId: this.data.map.id
    });
    
    gameEventLogger.matchStart(this.data.id, this.data.type, this.players.size);
    gameLogger.info('Match started', { 
      matchId: this.data.id,
      gameMode: this.data.type,
      playerCount: this.players.size
    });
  }

  async end(reason: string = 'completed'): Promise<boolean> {
    if (this.data.status === MatchStatus.FINISHED) {
      return false;
    }
    
    this.data.status = MatchStatus.FINISHED;
    this.data.endTime = new Date();
    this.data.updatedAt = new Date();
    this.endTime = this.data.endTime;
    this.isRunning = false;
    
    if (this.startTime) {
      this.data.duration = this.endTime.getTime() - this.startTime.getTime();
    }
    
    // Determine winner
    const winner = this.determineWinner();
    this.data.winner = winner;
    
    // Save replay
    await this.replaySystem.saveReplay();
    
    // Calculate final statistics
    await this.calculateFinalStatistics();
    
    this.emit('match:ended', winner);
    this.addEvent(EventType.MATCH_ENDED, undefined, undefined, {
      reason,
      winner,
      duration: this.data.duration,
      finalScores: Object.fromEntries(this.score)
    });
    
    gameEventLogger.matchEnd(this.data.id, this.data.duration, winner?.toString() || 'none');
    gameLogger.info('Match ended', { 
      matchId: this.data.id,
      reason,
      winner,
      duration: this.data.duration
    });
    
    return true;
  }

  update(deltaTime: number): void {
    if (!this.isRunning) return;
    
    const updateStart = Date.now();
    this.matchTimer += deltaTime;
    
    try {
      // Update game systems
      this.physics.update(deltaTime);
      this.combatSystem.update(deltaTime);
      this.skillSystem.update(deltaTime);
      this.itemSystem.update(deltaTime);
      this.aiManager.update(deltaTime);
      
      // Update match-specific logic
      this.updateGameMode(deltaTime);
      this.updateObjectives(deltaTime);
      this.updateResources(deltaTime);
      this.updateHazards(deltaTime);
      
      // Check win conditions
      this.checkWinConditions();
      
      // Check time limit
      if (this.matchTimer >= this.data.settings.timeLimit * 1000) {
        this.end('time_limit');
      }
      
      // Performance tracking
      const updateDuration = Date.now() - updateStart;
      this.updateCount++;
      this.averageUpdateTime = (this.averageUpdateTime * (this.updateCount - 1) + updateDuration) / this.updateCount;
      
      if (updateDuration > 50) { // Log slow updates
        gameLogger.warn('Slow match update', {
          matchId: this.data.id,
          duration: updateDuration,
          averageUpdateTime: this.averageUpdateTime
        });
      }
      
    } catch (error) {
      gameLogger.error('Error in match update', {
        matchId: this.data.id,
        error: error.message,
        stack: error.stack
      });
    }
  }

  // Player Actions
  async movePlayer(playerId: string, newPosition: Position): Promise<boolean> {
    const player = this.players.get(playerId);
    if (!player || !player.isAlive) {
      return false;
    }
    
    // Anti-cheat validation
    const isValidMove = await this.antiCheat.validateMovement(playerId, player.position, newPosition);
    if (!isValidMove) {
      gameLogger.warn('Invalid movement detected', { playerId, matchId: this.data.id });
      return false;
    }
    
    // Update physics
    await this.physics.movePlayer(playerId, newPosition);
    
    // Update player position
    player.position = newPosition;
    this.incrementPlayerActionCount(playerId);
    
    this.emit('player:moved', playerId, newPosition);
    this.replaySystem.recordMovement(playerId, newPosition);
    
    return true;
  }

  async playerAttack(attackerId: string, targetId: string): Promise<boolean> {
    const attacker = this.players.get(attackerId);
    const target = this.players.get(targetId);
    
    if (!attacker || !target || !attacker.isAlive || !target.isAlive) {
      return false;
    }
    
    // Check if attack is valid (range, cooldown, etc.)
    const canAttack = await this.combatSystem.canAttack(attackerId, targetId);
    if (!canAttack) {
      return false;
    }
    
    // Calculate damage
    const damage = await this.combatSystem.calculateDamage(attacker, target);
    
    // Apply damage
    target.health -= damage;
    attacker.damage += damage;
    
    this.incrementPlayerActionCount(attackerId);
    
    this.emit('player:attacked', attackerId, targetId, damage);
    this.replaySystem.recordAttack(attackerId, targetId, damage);
    
    // Check if target died
    if (target.health <= 0) {
      await this.killPlayer(targetId, attackerId, 'basic_attack');
    }
    
    return true;
  }

  async playerCastSpell(playerId: string, spellId: string, targetPosition?: Position, targetId?: string): Promise<boolean> {
    const player = this.players.get(playerId);
    if (!player || !player.isAlive) {
      return false;
    }
    
    // Check if spell can be cast
    const canCast = await this.skillSystem.canCastSpell(playerId, spellId);
    if (!canCast) {
      return false;
    }
    
    // Cast spell
    const spellResult = await this.skillSystem.castSpell(playerId, spellId, {
      targetPosition,
      targetId,
      casterPosition: player.position
    });
    
    if (!spellResult.success) {
      return false;
    }
    
    // Apply spell effects
    if (spellResult.effects) {
      for (const effect of spellResult.effects) {
        await this.applySpellEffect(effect, playerId);
      }
    }
    
    this.incrementPlayerActionCount(playerId);
    
    this.emit('player:spell_cast', playerId, spellId, targetPosition);
    this.replaySystem.recordSpellCast(playerId, spellId, targetPosition, targetId);
    
    return true;
  }

  async playerUseItem(playerId: string, itemId: string): Promise<boolean> {
    const player = this.players.get(playerId);
    if (!player || !player.isAlive) {
      return false;
    }
    
    // Use item through item system
    const result = await this.itemSystem.useItem(playerId, itemId);
    if (!result.success) {
      return false;
    }
    
    // Apply item effects
    if (result.effects) {
      for (const effect of result.effects) {
        await this.applyItemEffect(effect, playerId);
      }
    }
    
    this.incrementPlayerActionCount(playerId);
    
    this.replaySystem.recordItemUse(playerId, itemId);
    
    return true;
  }

  // Event Handlers
  private async handlePlayerDamaged(attackerId: string, victimId: string, damage: number): Promise<void> {
    const attacker = this.players.get(attackerId);
    const victim = this.players.get(victimId);
    
    if (attacker) {
      attacker.damage += damage;
    }
    
    if (victim) {
      victim.health -= damage;
      
      if (victim.health <= 0) {
        await this.killPlayer(victimId, attackerId, 'spell');
      }
    }
  }

  private async handlePlayerKilled(killerId: string, victimId: string, method: string): Promise<void> {
    await this.killPlayer(victimId, killerId, method);
  }

  private async killPlayer(victimId: string, killerId?: string, method: string = 'unknown'): Promise<void> {
    const victim = this.players.get(victimId);
    if (!victim) return;
    
    victim.isAlive = false;
    victim.deaths++;
    victim.health = 0;
    
    if (killerId && killerId !== victimId) {
      const killer = this.players.get(killerId);
      if (killer) {
        killer.kills++;
        killer.score += this.getKillScore();
        
        // Check for kill streaks and achievements
        await this.checkKillStreakAchievements(killerId);
      }
    }
    
    // Add to kill feed
    this.killFeed.push({
      killerId: killerId || '',
      victimId,
      method,
      timestamp: new Date()
    });
    
    // Keep only last 10 kills in feed
    if (this.killFeed.length > 10) {
      this.killFeed.shift();
    }
    
    // Update team score if team-based
    if (this.isTeamBasedMode() && killerId) {
      const killer = this.players.get(killerId);
      if (killer && killer.team) {
        const currentScore = this.score.get(killer.team) || 0;
        this.score.set(killer.team, currentScore + 1);
      }
    }
    
    this.emit('player:killed', killerId || '', victimId, method);
    this.addEvent(EventType.PLAYER_KILLED, killerId, victimId, { method });
    
    // Schedule respawn if enabled
    if (this.data.settings.respawnTime > 0) {
      setTimeout(() => {
        this.respawnPlayer(victimId);
      }, this.data.settings.respawnTime * 1000);
    }
  }

  private async respawnPlayer(playerId: string): Promise<void> {
    const player = this.players.get(playerId);
    if (!player || player.isAlive) return;
    
    // Reset player state
    player.isAlive = true;
    player.health = 100;
    player.mana = 100;
    player.stamina = 100;
    player.position = this.getSpawnPosition(player.team);
    
    // Update physics
    await this.physics.movePlayer(playerId, player.position);
    
    this.emit('player:respawned', playerId);
    this.addEvent(EventType.PLAYER_RESPAWNED, playerId, undefined, {
      position: player.position
    });
  }

  // Utility Methods
  getSpawnPosition(team?: number): Position {
    const spawnPoints = this.data.map.spawnPoints;
    if (spawnPoints.length === 0) {
      return { x: 0, y: 0, z: 0 };
    }
    
    // Team-based spawn selection
    if (team && this.isTeamBasedMode()) {
      const teamSpawns = spawnPoints.filter((_, index) => 
        team === 1 ? index < spawnPoints.length / 2 : index >= spawnPoints.length / 2
      );
      return teamSpawns[Math.floor(Math.random() * teamSpawns.length)];
    }
    
    // Random spawn
    return spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  }

  getMinPlayersToStart(): number {
    switch (this.data.type) {
      case GameMode.BATTLE_ROYALE: return 50;
      case GameMode.TEAM_DEATHMATCH: return 6;
      case GameMode.ARENA_1V1: return 2;
      case GameMode.CONQUEST: return 8;
      default: return 4;
    }
  }

  private isTeamBasedMode(): boolean {
    return [
      GameMode.TEAM_DEATHMATCH,
      GameMode.CONQUEST,
      GameMode.CAPTURE_THE_FLAG,
      GameMode.GUILD_WAR
    ].includes(this.data.type);
  }

  private getKillScore(): number {
    switch (this.data.type) {
      case GameMode.BATTLE_ROYALE: return 10;
      case GameMode.TEAM_DEATHMATCH: return 5;
      case GameMode.ARENA_1V1: return 50;
      default: return 10;
    }
  }

  private incrementPlayerActionCount(playerId: string): void {
    const current = this.playerActionCounts.get(playerId) || 0;
    this.playerActionCounts.set(playerId, current + 1);
    
    // Anti-cheat: Check for excessive actions
    if (current > 600) { // 10 actions per second for 60 seconds
      gameLogger.warn('Excessive player actions detected', {
        playerId,
        matchId: this.data.id,
        actionCount: current
      });
    }
  }

  private addEvent(type: EventType, playerId?: string, targetId?: string, data?: any): void {
    const event: MatchEvent = {
      id: uuidv4(),
      type,
      playerId,
      targetId,
      timestamp: new Date(),
      data: data || {}
    };
    
    this.data.events.push(event);
    
    // Keep only last 1000 events to prevent memory issues
    if (this.data.events.length > 1000) {
      this.data.events.shift();
    }
  }

  // Getters
  getData(): GameMatch {
    return { ...this.data };
  }

  getStatus(): MatchStatus {
    return this.data.status;
  }

  getCurrentPlayerCount(): number {
    return this.players.size;
  }

  getEndTime(): Date | undefined {
    return this.endTime;
  }

  getPlayers(): MatchPlayer[] {
    return Array.from(this.players.values());
  }

  getPlayer(playerId: string): MatchPlayer | undefined {
    return this.players.get(playerId);
  }

  getScore(): Map<number, number> {
    return new Map(this.score);
  }

  getKillFeed(): Array<{killerId: string, victimId: string, method: string, timestamp: Date}> {
    return [...this.killFeed];
  }

  // Performance and health metrics
  getPerformanceMetrics() {
    return {
      updateCount: this.updateCount,
      averageUpdateTime: this.averageUpdateTime,
      playerCount: this.players.size,
      matchDuration: this.matchTimer,
      eventsCount: this.data.events.length
    };
  }

  // Abstract methods that need implementation based on game mode
  private async startGameModeSpecificLogic(): Promise<void> {
    // Implementation varies by game mode
    gameLogger.debug('Starting game mode specific logic', { 
      gameMode: this.data.type,
      matchId: this.data.id 
    });
  }

  private updateGameMode(deltaTime: number): void {
    // Implementation varies by game mode
  }

  private updateObjectives(deltaTime: number): void {
    // Update capture points, flags, etc.
  }

  private updateResources(deltaTime: number): void {
    // Update resource spawns and respawns
  }

  private updateHazards(deltaTime: number): void {
    // Update environmental hazards
  }

  private checkWinConditions(): void {
    // Check game mode specific win conditions
  }

  private determineWinner(): string | string[] | undefined {
    // Determine winner based on game mode and current state
    if (this.isTeamBasedMode()) {
      // Find team with highest score
      let maxScore = -1;
      let winningTeam: number | undefined;
      
      for (const [team, score] of this.score) {
        if (score > maxScore) {
          maxScore = score;
          winningTeam = team;
        }
      }
      
      return winningTeam ? `team_${winningTeam}` : undefined;
    } else {
      // Individual winner (highest score)
      let maxScore = -1;
      let winner: string | undefined;
      
      for (const player of this.players.values()) {
        if (player.score > maxScore) {
          maxScore = player.score;
          winner = player.playerId;
        }
      }
      
      return winner;
    }
  }

  private async addAIBotsIfNeeded(): Promise<void> {
    const minPlayers = this.getMinPlayersToStart();
    const currentPlayers = this.players.size;
    
    if (currentPlayers < minPlayers) {
      const botsNeeded = Math.min(minPlayers - currentPlayers, 20); // Max 20 bots
      await this.aiManager.addBots(botsNeeded);
    }
  }

  private async applySpellEffect(effect: any, casterId: string): Promise<void> {
    // Apply spell effects to targets
  }

  private async applyItemEffect(effect: any, playerId: string): Promise<void> {
    // Apply item effects to player
  }

  private async checkKillStreakAchievements(playerId: string): Promise<void> {
    const player = this.players.get(playerId);
    if (!player) return;
    
    // Check for kill streak milestones and award achievements
    if (player.kills >= 5) {
      // Award "Killing Spree" achievement
      this.emit('achievement:unlocked', playerId);
    }
  }

  private async calculateFinalStatistics(): Promise<void> {
    // Calculate and save final match statistics
    for (const player of this.players.values()) {
      // Update player stats in database
      // Calculate KDR, accuracy, etc.
    }
  }

  private handleCollision(entity1: string, entity2: string, force: number): void {
    // Handle physics collisions between entities
  }

  private handleSpellCast(playerId: string, spellId: string, target?: any): void {
    // Handle spell casting completion
  }

  private handleBotAction(botId: string, action: string, data: any): void {
    // Handle AI bot actions
  }
}