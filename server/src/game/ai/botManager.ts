import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  MatchPlayer, 
  Position, 
  CharacterClass, 
  GameMode 
} from '@/types';
import { gameLogger } from '@/utils/logger';
import { AIBehaviorTree } from './behaviorTree';
import { MLDecisionEngine } from './mlEngine';
import { PathfindingSystem } from './pathfinding';
import { CombatAI } from './combatAI';
import { TeamCoordinator } from './teamCoordinator';

interface BotPersonality {
  aggression: number; // 0-1
  teamwork: number; // 0-1
  exploration: number; // 0-1
  riskTaking: number; // 0-1
  adaptability: number; // 0-1
  skillLevel: number; // 0-1
}

interface BotState {
  id: string;
  playerId: string;
  currentGoal: string;
  currentAction: string;
  lastActionTime: number;
  stateHistory: Array<{action: string, result: string, timestamp: number}>;
  learningData: Map<string, number>;
  personality: BotPersonality;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';
  reactionTime: number;
  accuracy: number;
  decisionCooldown: number;
  lastDecisionTime: number;
}

interface AIEvents {
  'bot:action': (botId: string, action: string, data: any) => void;
  'bot:killed': (botId: string, killerId: string) => void;
  'bot:kill': (botId: string, victimId: string) => void;
  'bot:objective_completed': (botId: string, objective: string) => void;
  'team:strategy_change': (teamId: number, strategy: string) => void;
}

export declare interface AIBotManager {
  on<U extends keyof AIEvents>(event: U, listener: AIEvents[U]): this;
  emit<U extends keyof AIEvents>(event: U, ...args: Parameters<AIEvents[U]>): boolean;
}

export class AIBotManager extends EventEmitter {
  private match: any; // Match reference
  private bots: Map<string, BotState> = new Map();
  private behaviorTrees: Map<string, AIBehaviorTree> = new Map();
  private mlEngine: MLDecisionEngine;
  private pathfinding: PathfindingSystem;
  private combatAI: CombatAI;
  private teamCoordinator: TeamCoordinator;
  
  // AI Configuration
  private tickRate: number = 10; // AI decisions per second
  private lastTick: number = 0;
  private globalStrategy: string = 'balanced';
  private difficultyModifiers: Map<string, any> = new Map();
  
  // Learning and adaptation
  private matchHistory: Array<any> = [];
  private playerBehaviorPatterns: Map<string, any> = new Map();
  private adaptationEnabled: boolean = true;
  
  // Performance tracking
  private decisionCount: number = 0;
  private averageDecisionTime: number = 0;
  private botPerformanceMetrics: Map<string, any> = new Map();

  constructor(match: any) {
    super();
    this.match = match;
    this.mlEngine = new MLDecisionEngine();
    this.pathfinding = new PathfindingSystem(match);
    this.combatAI = new CombatAI();
    this.teamCoordinator = new TeamCoordinator();
    
    this.initializeDifficultyModifiers();
  }

  async initialize(): Promise<void> {
    try {
      gameLogger.info('Initializing AI Bot Manager', { matchId: this.match.data.id });
      
      // Initialize AI subsystems
      await this.mlEngine.initialize();
      await this.pathfinding.initialize();
      await this.combatAI.initialize();
      await this.teamCoordinator.initialize();
      
      // Load pre-trained models if available
      await this.loadPreTrainedModels();
      
      // Set up AI tick loop
      this.startAILoop();
      
      gameLogger.info('AI Bot Manager initialized successfully');
    } catch (error) {
      gameLogger.error('Failed to initialize AI Bot Manager', { error: error.message });
      throw error;
    }
  }

  private initializeDifficultyModifiers(): void {
    this.difficultyModifiers.set('easy', {
      reactionTime: 800, // ms
      accuracy: 0.3,
      decisionCooldown: 1000,
      aimPrediction: 0.1,
      strategyComplexity: 0.2
    });
    
    this.difficultyModifiers.set('medium', {
      reactionTime: 500,
      accuracy: 0.5,
      decisionCooldown: 700,
      aimPrediction: 0.3,
      strategyComplexity: 0.4
    });
    
    this.difficultyModifiers.set('hard', {
      reactionTime: 300,
      accuracy: 0.7,
      decisionCooldown: 500,
      aimPrediction: 0.5,
      strategyComplexity: 0.6
    });
    
    this.difficultyModifiers.set('expert', {
      reactionTime: 200,
      accuracy: 0.8,
      decisionCooldown: 300,
      aimPrediction: 0.7,
      strategyComplexity: 0.8
    });
    
    this.difficultyModifiers.set('legendary', {
      reactionTime: 100,
      accuracy: 0.95,
      decisionCooldown: 200,
      aimPrediction: 0.9,
      strategyComplexity: 1.0
    });
  }

  async addBots(count: number): Promise<void> {
    const difficulties = ['easy', 'medium', 'hard', 'expert', 'legendary'];
    const gameMode = this.match.data.type;
    
    for (let i = 0; i < count; i++) {
      const botId = uuidv4();
      const difficulty = this.selectBotDifficulty(gameMode, i, count);
      const characterClass = this.selectBotClass(gameMode, difficulty);
      const personality = this.generateBotPersonality(difficulty);
      
      const bot = await this.createBot(botId, difficulty, characterClass, personality);
      
      // Add bot as player to match
      const matchPlayer: MatchPlayer = {
        playerId: bot.playerId,
        username: this.generateBotName(characterClass, difficulty),
        characterClass,
        level: this.calculateBotLevel(difficulty),
        team: this.assignBotTeam(gameMode, i),
        position: this.match.getSpawnPosition(),
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
        isReady: true,
        ping: this.simulateBotPing(difficulty),
        isBot: true
      };
      
      const added = await this.match.addPlayer(matchPlayer);
      if (added) {
        this.bots.set(botId, bot);
        this.behaviorTrees.set(botId, new AIBehaviorTree(bot, this.match));
        
        gameLogger.info('Bot added to match', { 
          botId, 
          difficulty, 
          characterClass, 
          matchId: this.match.data.id 
        });
      }
    }
    
    // Initialize team coordination if team-based mode
    if (this.isTeamBasedMode(gameMode)) {
      await this.teamCoordinator.initializeTeams(this.getTeamBots());
    }
  }

  private async createBot(
    botId: string, 
    difficulty: string, 
    characterClass: CharacterClass, 
    personality: BotPersonality
  ): Promise<BotState> {
    const modifiers = this.difficultyModifiers.get(difficulty)!;
    
    return {
      id: botId,
      playerId: `bot_${botId}`,
      currentGoal: 'initialize',
      currentAction: 'idle',
      lastActionTime: Date.now(),
      stateHistory: [],
      learningData: new Map(),
      personality,
      difficulty: difficulty as any,
      reactionTime: modifiers.reactionTime,
      accuracy: modifiers.accuracy,
      decisionCooldown: modifiers.decisionCooldown,
      lastDecisionTime: 0
    };
  }

  private generateBotPersonality(difficulty: string): BotPersonality {
    const base = this.difficultyModifiers.get(difficulty)!;
    
    return {
      aggression: Math.random() * 0.4 + base.accuracy * 0.6,
      teamwork: Math.random() * 0.3 + 0.4,
      exploration: Math.random() * 0.5 + 0.3,
      riskTaking: Math.random() * 0.6 + 0.2,
      adaptability: Math.random() * 0.3 + base.strategyComplexity * 0.7,
      skillLevel: base.accuracy
    };
  }

  private selectBotDifficulty(gameMode: GameMode, botIndex: number, totalBots: number): string {
    // Dynamic difficulty distribution based on game mode
    const difficultyDistribution = this.getDifficultyDistribution(gameMode);
    const normalizedIndex = botIndex / totalBots;
    
    let cumulativeProbability = 0;
    for (const [difficulty, probability] of difficultyDistribution) {
      cumulativeProbability += probability;
      if (normalizedIndex <= cumulativeProbability) {
        return difficulty;
      }
    }
    
    return 'medium'; // Fallback
  }

  private getDifficultyDistribution(gameMode: GameMode): Array<[string, number]> {
    switch (gameMode) {
      case GameMode.BATTLE_ROYALE:
        return [
          ['easy', 0.3],
          ['medium', 0.4],
          ['hard', 0.2],
          ['expert', 0.08],
          ['legendary', 0.02]
        ];
      case GameMode.ARENA_1V1:
        return [
          ['medium', 0.3],
          ['hard', 0.4],
          ['expert', 0.25],
          ['legendary', 0.05]
        ];
      case GameMode.TEAM_DEATHMATCH:
        return [
          ['easy', 0.2],
          ['medium', 0.4],
          ['hard', 0.3],
          ['expert', 0.1]
        ];
      default:
        return [
          ['easy', 0.25],
          ['medium', 0.35],
          ['hard', 0.25],
          ['expert', 0.15]
        ];
    }
  }

  private selectBotClass(gameMode: GameMode, difficulty: string): CharacterClass {
    const classes = Object.values(CharacterClass);
    
    // Advanced bots prefer more complex classes
    if (difficulty === 'legendary' || difficulty === 'expert') {
      const advancedClasses = [CharacterClass.MAGE, CharacterClass.NECROMANCER, CharacterClass.ASSASSIN];
      return advancedClasses[Math.floor(Math.random() * advancedClasses.length)];
    }
    
    // Balanced distribution for other difficulties
    return classes[Math.floor(Math.random() * classes.length)];
  }

  private generateBotName(characterClass: CharacterClass, difficulty: string): string {
    const classNames = {
      [CharacterClass.WARRIOR]: ['Ironforge', 'Battleaxe', 'Shieldwall', 'Berserker', 'Guardian'],
      [CharacterClass.ARCHER]: ['Hawkeye', 'Swiftarrow', 'Ranger', 'Marksman', 'Hunter'],
      [CharacterClass.MAGE]: ['Flamestrike', 'Frostbolt', 'Arcane', 'Spellweaver', 'Mystic'],
      [CharacterClass.PALADIN]: ['Lightbringer', 'Defender', 'Crusader', 'Divine', 'Protector'],
      [CharacterClass.ASSASSIN]: ['Shadowstrike', 'Viper', 'Nightblade', 'Phantom', 'Stealth'],
      [CharacterClass.NECROMANCER]: ['Bonechill', 'Deathwhisper', 'Lich', 'Darkmage', 'Soulreaper']
    };
    
    const difficultyPrefixes = {
      easy: ['Novice', 'Apprentice', 'Rookie'],
      medium: ['Veteran', 'Skilled', 'Trained'],
      hard: ['Elite', 'Master', 'Expert'],
      expert: ['Grand', 'Supreme', 'Legendary'],
      legendary: ['Immortal', 'Divine', 'Mythic']
    };
    
    const names = classNames[characterClass];
    const prefixes = difficultyPrefixes[difficulty];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    return `${prefix}${name}`;
  }

  private calculateBotLevel(difficulty: string): number {
    const levelRanges = {
      easy: [1, 15],
      medium: [10, 25],
      hard: [20, 35],
      expert: [30, 45],
      legendary: [40, 50]
    };
    
    const [min, max] = levelRanges[difficulty];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private assignBotTeam(gameMode: GameMode, botIndex: number): number | undefined {
    if (!this.isTeamBasedMode(gameMode)) {
      return undefined;
    }
    
    // Alternate team assignment
    return (botIndex % 2) + 1;
  }

  private simulateBotPing(difficulty: string): number {
    const pingRanges = {
      easy: [80, 150],
      medium: [50, 100],
      hard: [30, 70],
      expert: [20, 50],
      legendary: [10, 30]
    };
    
    const [min, max] = pingRanges[difficulty];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private startAILoop(): void {
    const tickInterval = 1000 / this.tickRate; // Convert to milliseconds
    
    setInterval(() => {
      this.updateAI();
    }, tickInterval);
  }

  update(deltaTime: number): void {
    if (Date.now() - this.lastTick < 1000 / this.tickRate) {
      return;
    }
    
    this.updateAI();
    this.lastTick = Date.now();
  }

  private updateAI(): void {
    const updateStart = Date.now();
    
    try {
      // Update each bot's AI
      for (const [botId, bot] of this.bots) {
        this.updateBotAI(botId, bot);
      }
      
      // Update team coordination
      if (this.isTeamBasedMode(this.match.data.type)) {
        this.teamCoordinator.updateTeamStrategies();
      }
      
      // Update global strategy based on match state
      this.updateGlobalStrategy();
      
      // Performance tracking
      const updateDuration = Date.now() - updateStart;
      this.averageDecisionTime = (this.averageDecisionTime * this.decisionCount + updateDuration) / (this.decisionCount + 1);
      this.decisionCount++;
      
    } catch (error) {
      gameLogger.error('Error in AI update', { error: error.message });
    }
  }

  private async updateBotAI(botId: string, bot: BotState): Promise<void> {
    const currentTime = Date.now();
    
    // Check if bot can make a decision (cooldown)
    if (currentTime - bot.lastDecisionTime < bot.decisionCooldown) {
      return;
    }
    
    // Get current match player data
    const matchPlayer = this.match.getPlayer(bot.playerId);
    if (!matchPlayer || !matchPlayer.isAlive) {
      return;
    }
    
    // Get behavior tree for this bot
    const behaviorTree = this.behaviorTrees.get(botId);
    if (!behaviorTree) {
      return;
    }
    
    try {
      // Update bot's understanding of the game state
      const gameState = this.analyzeGameState(matchPlayer);
      
      // Get ML decision recommendation
      const mlDecision = await this.mlEngine.getDecision(bot, gameState, matchPlayer);
      
      // Execute behavior tree with ML guidance
      const action = await behaviorTree.execute(gameState, mlDecision);
      
      if (action) {
        await this.executeBotAction(botId, action, matchPlayer);
        bot.lastDecisionTime = currentTime;
        
        // Record action for learning
        this.recordBotAction(bot, action, gameState);
      }
      
    } catch (error) {
      gameLogger.error('Error updating bot AI', { botId, error: error.message });
    }
  }

  private analyzeGameState(matchPlayer: MatchPlayer): any {
    const enemies = this.match.getPlayers().filter((p: MatchPlayer) => 
      p.playerId !== matchPlayer.playerId && 
      p.isAlive && 
      (!matchPlayer.team || p.team !== matchPlayer.team)
    );
    
    const allies = this.match.getPlayers().filter((p: MatchPlayer) => 
      p.playerId !== matchPlayer.playerId && 
      p.isAlive && 
      matchPlayer.team && 
      p.team === matchPlayer.team
    );
    
    const nearbyEnemies = enemies.filter((enemy: MatchPlayer) => 
      this.calculateDistance(matchPlayer.position, enemy.position) < 500
    );
    
    const nearbyAllies = allies.filter((ally: MatchPlayer) => 
      this.calculateDistance(matchPlayer.position, ally.position) < 300
    );
    
    return {
      player: matchPlayer,
      enemies,
      allies,
      nearbyEnemies,
      nearbyAllies,
      healthPercentage: matchPlayer.health / 100,
      manaPercentage: matchPlayer.mana / 100,
      isOutnumbered: nearbyEnemies.length > nearbyAllies.length + 1,
      safeZone: this.findSafeZone(matchPlayer.position),
      objectives: this.getAvailableObjectives(),
      resources: this.getNearbyResources(matchPlayer.position),
      matchTime: this.match.matchTimer || 0
    };
  }

  private async executeBotAction(botId: string, action: any, matchPlayer: MatchPlayer): Promise<void> {
    const bot = this.bots.get(botId);
    if (!bot) return;
    
    // Add reaction time delay for realism
    if (bot.reactionTime > 0) {
      await this.delay(bot.reactionTime);
    }
    
    switch (action.type) {
      case 'move':
        await this.executeMoveAction(bot, action.target, matchPlayer);
        break;
      case 'attack':
        await this.executeAttackAction(bot, action.target, matchPlayer);
        break;
      case 'cast_spell':
        await this.executeCastSpellAction(bot, action.spell, action.target, matchPlayer);
        break;
      case 'use_item':
        await this.executeUseItemAction(bot, action.item, matchPlayer);
        break;
      case 'retreat':
        await this.executeRetreatAction(bot, matchPlayer);
        break;
      case 'follow_ally':
        await this.executeFollowAllyAction(bot, action.target, matchPlayer);
        break;
      case 'capture_objective':
        await this.executeCaptureObjectiveAction(bot, action.objective, matchPlayer);
        break;
      default:
        gameLogger.warn('Unknown bot action type', { botId, actionType: action.type });
    }
    
    bot.currentAction = action.type;
    bot.lastActionTime = Date.now();
    
    this.emit('bot:action', botId, action.type, action);
  }

  private async executeMoveAction(bot: BotState, target: Position, matchPlayer: MatchPlayer): Promise<void> {
    // Calculate path to target
    const path = await this.pathfinding.findPath(matchPlayer.position, target);
    if (path.length === 0) return;
    
    // Move towards next waypoint
    const nextWaypoint = path[0];
    const success = await this.match.movePlayer(matchPlayer.playerId, nextWaypoint);
    
    if (success && this.adaptationEnabled) {
      // Learn from successful movement
      this.updateBotLearning(bot, 'movement_success', 1.0);
    }
  }

  private async executeAttackAction(bot: BotState, targetId: string, matchPlayer: MatchPlayer): Promise<void> {
    const target = this.match.getPlayer(targetId);
    if (!target || !target.isAlive) return;
    
    // Apply accuracy modifier
    const hitChance = Math.random();
    if (hitChance > bot.accuracy) {
      // Miss - learn from failure
      this.updateBotLearning(bot, 'attack_miss', -0.1);
      return;
    }
    
    const success = await this.match.playerAttack(matchPlayer.playerId, targetId);
    
    if (success) {
      this.updateBotLearning(bot, 'attack_hit', 0.2);
    }
  }

  private async executeCastSpellAction(
    bot: BotState, 
    spellId: string, 
    target: any, 
    matchPlayer: MatchPlayer
  ): Promise<void> {
    const success = await this.match.playerCastSpell(
      matchPlayer.playerId, 
      spellId, 
      target.position, 
      target.playerId
    );
    
    if (success) {
      this.updateBotLearning(bot, 'spell_success', 0.3);
    } else {
      this.updateBotLearning(bot, 'spell_failed', -0.2);
    }
  }

  private async executeUseItemAction(bot: BotState, itemId: string, matchPlayer: MatchPlayer): Promise<void> {
    const success = await this.match.playerUseItem(matchPlayer.playerId, itemId);
    
    if (success) {
      this.updateBotLearning(bot, 'item_use_success', 0.1);
    }
  }

  private async executeRetreatAction(bot: BotState, matchPlayer: MatchPlayer): Promise<void> {
    // Find safe retreat position
    const safePosition = this.findSafeZone(matchPlayer.position);
    if (safePosition) {
      await this.executeMoveAction(bot, safePosition, matchPlayer);
      this.updateBotLearning(bot, 'retreat_executed', 0.15);
    }
  }

  private async executeFollowAllyAction(bot: BotState, allyId: string, matchPlayer: MatchPlayer): Promise<void> {
    const ally = this.match.getPlayer(allyId);
    if (!ally || !ally.isAlive) return;
    
    // Move towards ally position with some offset
    const followPosition = this.calculateFollowPosition(ally.position, matchPlayer.position);
    await this.executeMoveAction(bot, followPosition, matchPlayer);
  }

  private async executeCaptureObjectiveAction(
    bot: BotState, 
    objectiveId: string, 
    matchPlayer: MatchPlayer
  ): Promise<void> {
    // Move towards objective and attempt capture
    const objective = this.getObjective(objectiveId);
    if (objective) {
      await this.executeMoveAction(bot, objective.position, matchPlayer);
      this.updateBotLearning(bot, 'objective_focused', 0.25);
    }
  }

  // Learning and adaptation methods
  private recordBotAction(bot: BotState, action: any, gameState: any): void {
    bot.stateHistory.push({
      action: action.type,
      result: 'pending',
      timestamp: Date.now()
    });
    
    // Keep only recent history
    if (bot.stateHistory.length > 100) {
      bot.stateHistory.shift();
    }
    
    // Feed data to ML engine for learning
    if (this.adaptationEnabled) {
      this.mlEngine.recordAction(bot.id, action, gameState);
    }
  }

  private updateBotLearning(bot: BotState, event: string, reward: number): void {
    const currentValue = bot.learningData.get(event) || 0;
    bot.learningData.set(event, currentValue + reward);
    
    // Update the most recent action result
    if (bot.stateHistory.length > 0) {
      const lastAction = bot.stateHistory[bot.stateHistory.length - 1];
      lastAction.result = reward > 0 ? 'success' : 'failure';
    }
  }

  private updateGlobalStrategy(): void {
    const matchState = this.analyzeMatchState();
    
    // Adapt global strategy based on match progression
    if (matchState.timeRemaining < 0.3 && matchState.scoreGap > 0.2) {
      this.globalStrategy = 'aggressive';
    } else if (matchState.timeRemaining < 0.5 && matchState.scoreGap < -0.2) {
      this.globalStrategy = 'defensive';
    } else {
      this.globalStrategy = 'balanced';
    }
    
    // Notify team coordinator of strategy change
    this.teamCoordinator.updateGlobalStrategy(this.globalStrategy);
  }

  // Utility methods
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = (pos1.z || 0) - (pos2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private findSafeZone(currentPosition: Position): Position | null {
    // Find position away from enemies
    // This is a simplified implementation
    return {
      x: currentPosition.x + (Math.random() - 0.5) * 200,
      y: currentPosition.y + (Math.random() - 0.5) * 200,
      z: currentPosition.z || 0
    };
  }

  private calculateFollowPosition(allyPosition: Position, currentPosition: Position): Position {
    const distance = 100; // Stay 100 units away from ally
    const angle = Math.random() * Math.PI * 2; // Random angle around ally
    
    return {
      x: allyPosition.x + Math.cos(angle) * distance,
      y: allyPosition.y + Math.sin(angle) * distance,
      z: allyPosition.z || 0
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isTeamBasedMode(gameMode: GameMode): boolean {
    return [GameMode.TEAM_DEATHMATCH, GameMode.CONQUEST, GameMode.GUILD_WAR].includes(gameMode);
  }

  private getTeamBots(): Map<number, string[]> {
    const teamBots = new Map<number, string[]>();
    
    for (const [botId, bot] of this.bots) {
      const matchPlayer = this.match.getPlayer(bot.playerId);
      if (matchPlayer && matchPlayer.team) {
        const team = teamBots.get(matchPlayer.team) || [];
        team.push(botId);
        teamBots.set(matchPlayer.team, team);
      }
    }
    
    return teamBots;
  }

  private getAvailableObjectives(): any[] {
    // Return available objectives from match
    return [];
  }

  private getNearbyResources(position: Position): any[] {
    // Return nearby resources
    return [];
  }

  private getObjective(objectiveId: string): any {
    // Return specific objective
    return null;
  }

  private analyzeMatchState(): any {
    return {
      timeRemaining: 1.0,
      scoreGap: 0.0
    };
  }

  private async loadPreTrainedModels(): Promise<void> {
    // Load pre-trained ML models
    gameLogger.info('Loading pre-trained AI models...');
  }

  // Public interface
  async removeBots(count: number): Promise<void> {
    const botIds = Array.from(this.bots.keys()).slice(0, count);
    
    for (const botId of botIds) {
      const bot = this.bots.get(botId);
      if (bot) {
        await this.match.removePlayer(bot.playerId);
        this.bots.delete(botId);
        this.behaviorTrees.delete(botId);
      }
    }
  }

  getBotCount(): number {
    return this.bots.size;
  }

  getBotPerformanceMetrics(): any {
    return {
      totalBots: this.bots.size,
      decisionCount: this.decisionCount,
      averageDecisionTime: this.averageDecisionTime,
      globalStrategy: this.globalStrategy,
      adaptationEnabled: this.adaptationEnabled
    };
  }

  async shutdown(): Promise<void> {
    // Clean up AI systems
    await this.mlEngine.shutdown();
    await this.pathfinding.shutdown();
    await this.combatAI.shutdown();
    await this.teamCoordinator.shutdown();
    
    this.bots.clear();
    this.behaviorTrees.clear();
    
    gameLogger.info('AI Bot Manager shutdown complete');
  }
}