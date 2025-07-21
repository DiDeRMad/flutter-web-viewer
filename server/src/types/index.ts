// ================= USER & AUTHENTICATION TYPES =================
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  ipAddress?: string;
  deviceInfo?: string;
  isBanned?: boolean;
  banReason?: string;
  banExpiresAt?: Date;
  role: UserRole;
  subscription?: SubscriptionTier;
  subscriptionExpiresAt?: Date;
}

export enum UserRole {
  PLAYER = 'player',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  DEVELOPER = 'developer'
}

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  ELITE = 'elite',
  LEGENDARY = 'legendary'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  captcha?: string;
}

// ================= PLAYER & CHARACTER TYPES =================
export interface Player {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  level: number;
  experience: number;
  experienceToNext: number;
  characterClass: CharacterClass;
  stats: PlayerStats;
  inventory: PlayerInventory;
  equipment: PlayerEquipment;
  skills: PlayerSkills;
  achievements: Achievement[];
  guild?: Guild;
  guildRole?: GuildRole;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date;
  isOnline: boolean;
  currentMatch?: string;
  preferences: PlayerPreferences;
  economy: PlayerEconomy;
}

export enum CharacterClass {
  WARRIOR = 'warrior',
  ARCHER = 'archer',
  MAGE = 'mage',
  PALADIN = 'paladin',
  ASSASSIN = 'assassin',
  NECROMANCER = 'necromancer'
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  
  // Core attributes
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  luck: number;
  
  // Combat stats
  attackPower: number;
  spellPower: number;
  defense: number;
  magicResistance: number;
  criticalChance: number;
  criticalDamage: number;
  attackSpeed: number;
  movementSpeed: number;
  
  // Special stats
  lifeSteal: number;
  manaSteal: number;
  cooldownReduction: number;
  experienceBonus: number;
  goldBonus: number;
}

export interface PlayerInventory {
  items: InventoryItem[];
  maxSlots: number;
  gold: number;
  gems: number;
  tokens: number;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
  slot: number;
  isEquipped: boolean;
  enchantmentLevel?: number;
  gemSockets?: GemSocket[];
  durability?: number;
  maxDurability?: number;
  boundToPlayer?: boolean;
  acquiredAt: Date;
}

export interface PlayerEquipment {
  helmet?: InventoryItem;
  chest?: InventoryItem;
  legs?: InventoryItem;
  boots?: InventoryItem;
  gloves?: InventoryItem;
  weapon?: InventoryItem;
  shield?: InventoryItem;
  ring1?: InventoryItem;
  ring2?: InventoryItem;
  necklace?: InventoryItem;
  cape?: InventoryItem;
}

export interface PlayerSkills {
  skillPoints: number;
  skills: Record<string, PlayerSkill>;
}

export interface PlayerSkill {
  id: string;
  level: number;
  experience: number;
  experienceToNext: number;
  maxLevel: number;
  isActive: boolean;
  lastUsed?: Date;
  cooldownEndsAt?: Date;
}

export interface PlayerPreferences {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  controls: ControlSettings;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: string;
  fullscreen: boolean;
  vsync: boolean;
  shadows: boolean;
  particles: boolean;
  antialiasing: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  muteAll: boolean;
}

export interface ControlSettings {
  keyBindings: Record<string, string>;
  mouseSensitivity: number;
  invertY: boolean;
  autoRun: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  allowGuildInvites: boolean;
  allowTradeRequests: boolean;
  showAchievements: boolean;
}

export interface NotificationSettings {
  friendOnline: boolean;
  guildMessages: boolean;
  matchFound: boolean;
  achievementUnlocked: boolean;
  itemReceived: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface PlayerEconomy {
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalGemsEarned: number;
  totalGemsSpent: number;
  premiumCurrency: number;
  purchases: Purchase[];
  marketTransactions: MarketTransaction[];
}

// ================= ITEMS & EQUIPMENT TYPES =================
export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  level: number;
  requirements: ItemRequirements;
  stats: ItemStats;
  effects: ItemEffect[];
  value: number;
  stackable: boolean;
  maxStack?: number;
  tradeable: boolean;
  sellable: boolean;
  droppable: boolean;
  durability?: number;
  maxDurability?: number;
  gemSockets?: number;
  iconUrl: string;
  modelUrl?: string;
  craftingRecipe?: CraftingRecipe;
  setId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  CRAFTING_MATERIAL = 'crafting_material',
  GEM = 'gem',
  QUEST_ITEM = 'quest_item',
  COSMETIC = 'cosmetic',
  PET = 'pet',
  MOUNT = 'mount'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
  DIVINE = 'divine'
}

export interface ItemRequirements {
  level?: number;
  characterClass?: CharacterClass[];
  strength?: number;
  agility?: number;
  intelligence?: number;
  vitality?: number;
  questCompleted?: string[];
  achievementUnlocked?: string[];
}

export interface ItemStats {
  [key: string]: number;
}

export interface ItemEffect {
  id: string;
  type: EffectType;
  value: number;
  duration?: number;
  chance?: number;
  target: EffectTarget;
  condition?: EffectCondition;
}

export enum EffectType {
  DAMAGE = 'damage',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  TELEPORT = 'teleport',
  SUMMON = 'summon',
  TRANSFORM = 'transform',
  SHIELD = 'shield',
  IMMUNITY = 'immunity'
}

export enum EffectTarget {
  SELF = 'self',
  ENEMY = 'enemy',
  ALLY = 'ally',
  ALL_ENEMIES = 'all_enemies',
  ALL_ALLIES = 'all_allies',
  AREA = 'area'
}

export interface EffectCondition {
  type: 'health_below' | 'mana_below' | 'enemy_type' | 'time_of_day' | 'location';
  value: any;
}

export interface GemSocket {
  id: string;
  gemId?: string;
  gemType: GemType;
  bonusStats?: ItemStats;
}

export enum GemType {
  RUBY = 'ruby',
  SAPPHIRE = 'sapphire',
  EMERALD = 'emerald',
  DIAMOND = 'diamond',
  TOPAZ = 'topaz',
  AMETHYST = 'amethyst'
}

export interface CraftingRecipe {
  id: string;
  resultItemId: string;
  resultQuantity: number;
  materials: CraftingMaterial[];
  skillRequired: string;
  skillLevel: number;
  craftingTime: number;
  successChance: number;
}

export interface CraftingMaterial {
  itemId: string;
  quantity: number;
}

// ================= GAME MATCH TYPES =================
export interface GameMatch {
  id: string;
  type: GameMode;
  status: MatchStatus;
  players: MatchPlayer[];
  maxPlayers: number;
  currentPlayers: number;
  map: GameMap;
  settings: MatchSettings;
  startTime?: Date;
  endTime?: Date;
  duration: number;
  winner?: string | string[];
  spectators: string[];
  events: MatchEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export enum GameMode {
  BATTLE_ROYALE = 'battle_royale',
  TEAM_DEATHMATCH = 'team_deathmatch',
  CONQUEST = 'conquest',
  GUILD_WAR = 'guild_war',
  PVE_DUNGEON = 'pve_dungeon',
  ARENA_1V1 = 'arena_1v1',
  CAPTURE_THE_FLAG = 'capture_the_flag',
  KING_OF_THE_HILL = 'king_of_the_hill'
}

export enum MatchStatus {
  WAITING = 'waiting',
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  CANCELLED = 'cancelled'
}

export interface MatchPlayer {
  playerId: string;
  username: string;
  characterClass: CharacterClass;
  level: number;
  team?: number;
  position: Position;
  health: number;
  mana: number;
  stamina: number;
  isAlive: boolean;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  damage: number;
  healing: number;
  joinedAt: Date;
  leftAt?: Date;
  isReady: boolean;
  ping: number;
  isBot?: boolean;
}

export interface Position {
  x: number;
  y: number;
  z?: number;
  rotation?: number;
}

export interface GameMap {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  maxPlayers: number;
  gameMode: GameMode[];
  size: MapSize;
  terrain: TerrainType;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  spawnPoints: Position[];
  objectives: MapObjective[];
  hazards: MapHazard[];
  resources: MapResource[];
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum MapSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  MASSIVE = 'massive'
}

export enum TerrainType {
  FOREST = 'forest',
  DESERT = 'desert',
  MOUNTAINS = 'mountains',
  URBAN = 'urban',
  WINTER = 'winter',
  VOLCANIC = 'volcanic',
  UNDERWATER = 'underwater',
  SPACE = 'space'
}

export enum WeatherType {
  CLEAR = 'clear',
  RAIN = 'rain',
  SNOW = 'snow',
  FOG = 'fog',
  STORM = 'storm',
  SANDSTORM = 'sandstorm'
}

export enum TimeOfDay {
  DAWN = 'dawn',
  DAY = 'day',
  DUSK = 'dusk',
  NIGHT = 'night'
}

export interface MapObjective {
  id: string;
  type: ObjectiveType;
  position: Position;
  radius: number;
  captureTime: number;
  pointValue: number;
  isActive: boolean;
}

export enum ObjectiveType {
  CONTROL_POINT = 'control_point',
  FLAG = 'flag',
  ARTIFACT = 'artifact',
  KING_OF_HILL = 'king_of_hill',
  BOSS_SPAWN = 'boss_spawn'
}

export interface MapHazard {
  id: string;
  type: HazardType;
  position: Position;
  radius: number;
  damage: number;
  interval: number;
  isActive: boolean;
}

export enum HazardType {
  LAVA = 'lava',
  SPIKES = 'spikes',
  POISON_GAS = 'poison_gas',
  LIGHTNING = 'lightning',
  FALLING_ROCKS = 'falling_rocks'
}

export interface MapResource {
  id: string;
  type: ResourceType;
  position: Position;
  respawnTime: number;
  value: number;
  isAvailable: boolean;
}

export enum ResourceType {
  HEALTH_POTION = 'health_potion',
  MANA_POTION = 'mana_potion',
  WEAPON_PICKUP = 'weapon_pickup',
  ARMOR_PICKUP = 'armor_pickup',
  GOLD_CHEST = 'gold_chest',
  EXPERIENCE_ORB = 'experience_orb'
}

export interface MatchSettings {
  timeLimit: number;
  scoreLimit: number;
  friendly_fire: boolean;
  respawnTime: number;
  startingEquipment: string[];
  allowedClasses: CharacterClass[];
  pvpEnabled: boolean;
  spectatingAllowed: boolean;
  chatEnabled: boolean;
  customRules?: Record<string, any>;
}

export interface MatchEvent {
  id: string;
  type: EventType;
  playerId?: string;
  targetId?: string;
  timestamp: Date;
  data: Record<string, any>;
}

export enum EventType {
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  PLAYER_KILLED = 'player_killed',
  PLAYER_RESPAWNED = 'player_respawned',
  OBJECTIVE_CAPTURED = 'objective_captured',
  ITEM_PICKED_UP = 'item_picked_up',
  SPELL_CAST = 'spell_cast',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  MATCH_STARTED = 'match_started',
  MATCH_ENDED = 'match_ended'
}

// ================= GUILD SYSTEM TYPES =================
export interface Guild {
  id: string;
  name: string;
  tag: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
  level: number;
  experience: number;
  experienceToNext: number;
  members: GuildMember[];
  maxMembers: number;
  treasury: number;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  isPublic: boolean;
  requirements: GuildRequirements;
  perks: GuildPerk[];
  wars: GuildWar[];
  achievements: Achievement[];
}

export interface GuildMember {
  playerId: string;
  username: string;
  role: GuildRole;
  joinedAt: Date;
  lastSeenAt: Date;
  contributionPoints: number;
  weeklyContribution: number;
  isOnline: boolean;
}

export enum GuildRole {
  MEMBER = 'member',
  OFFICER = 'officer',
  LEADER = 'leader',
  FOUNDER = 'founder'
}

export interface GuildRequirements {
  minLevel: number;
  minPowerLevel?: number;
  applicationRequired: boolean;
  inviteOnly: boolean;
}

export interface GuildPerk {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  effects: ItemEffect[];
  isActive: boolean;
  unlockedAt?: Date;
}

export interface GuildWar {
  id: string;
  attackingGuildId: string;
  defendingGuildId: string;
  status: WarStatus;
  startTime: Date;
  endTime: Date;
  attackingScore: number;
  defendingScore: number;
  battles: GuildBattle[];
  rewards: WarReward[];
}

export enum WarStatus {
  DECLARED = 'declared',
  PREPARATION = 'preparation',
  ACTIVE = 'active',
  FINISHED = 'finished',
  CANCELLED = 'cancelled'
}

export interface GuildBattle {
  id: string;
  matchId: string;
  attackingPlayers: string[];
  defendingPlayers: string[];
  winner: 'attacking' | 'defending' | 'draw';
  points: number;
  timestamp: Date;
}

export interface WarReward {
  type: 'gold' | 'experience' | 'items' | 'reputation';
  value: number;
  itemIds?: string[];
}

// ================= ACHIEVEMENT SYSTEM TYPES =================
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: AchievementCategory;
  rarity: ItemRarity;
  points: number;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  isSecret: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export enum AchievementCategory {
  COMBAT = 'combat',
  EXPLORATION = 'exploration',
  SOCIAL = 'social',
  CRAFTING = 'crafting',
  COLLECTION = 'collection',
  PROGRESSION = 'progression',
  SPECIAL = 'special'
}

export interface AchievementRequirement {
  type: 'kills' | 'deaths' | 'wins' | 'level' | 'items_collected' | 'distance_traveled' | 'time_played';
  value: number;
  target?: string;
}

export interface AchievementReward {
  type: 'experience' | 'gold' | 'items' | 'title' | 'cosmetic';
  value: number;
  itemIds?: string[];
  titleId?: string;
  cosmeticId?: string;
}

// ================= CHAT & COMMUNICATION TYPES =================
export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  recipientId?: string;
  channelId?: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  reactions: MessageReaction[];
  attachments?: MessageAttachment[];
}

export enum MessageType {
  GLOBAL = 'global',
  GUILD = 'guild',
  PARTY = 'party',
  PRIVATE = 'private',
  SYSTEM = 'system',
  TRADE = 'trade',
  HELP = 'help'
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  members: string[];
  moderators: string[];
  isPublic: boolean;
  maxMembers?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ChannelType {
  GLOBAL = 'global',
  GUILD = 'guild',
  PARTY = 'party',
  PRIVATE = 'private',
  CUSTOM = 'custom'
}

// ================= MARKETPLACE & ECONOMY TYPES =================
export interface MarketListing {
  id: string;
  sellerId: string;
  sellerUsername: string;
  itemId: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  currency: CurrencyType;
  duration: number;
  expiresAt: Date;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
  watchers: string[];
  bids: MarketBid[];
}

export enum CurrencyType {
  GOLD = 'gold',
  GEMS = 'gems',
  TOKENS = 'tokens',
  PREMIUM = 'premium'
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface MarketBid {
  id: string;
  bidderId: string;
  bidderUsername: string;
  amount: number;
  currency: CurrencyType;
  timestamp: Date;
  isWinning: boolean;
}

export interface MarketTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  itemId: string;
  quantity: number;
  price: number;
  currency: CurrencyType;
  timestamp: Date;
  fees: number;
  netAmount: number;
}

export interface Purchase {
  id: string;
  playerId: string;
  itemType: 'premium_currency' | 'cosmetic' | 'boost' | 'subscription';
  itemId: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  paymentMethod: string;
  status: PurchaseStatus;
  timestamp: Date;
  receiptUrl?: string;
}

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// ================= STATISTICS & ANALYTICS TYPES =================
export interface PlayerStatistics {
  playerId: string;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  killDeathRatio: number;
  totalDamage: number;
  totalHealing: number;
  playtime: number;
  averageMatchDuration: number;
  favoriteClass: CharacterClass;
  favoriteMap: string;
  highestKillStreak: number;
  achievements: number;
  guildContributions: number;
  marketTransactions: number;
  totalGoldEarned: number;
  totalExperienceGained: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchStatistics {
  matchId: string;
  gameMode: GameMode;
  mapId: string;
  duration: number;
  playerCount: number;
  averageLevel: number;
  totalKills: number;
  totalDamage: number;
  mvpPlayerId: string;
  timestamp: Date;
}

export interface ServerStatistics {
  timestamp: Date;
  onlinePlayers: number;
  activeMatches: number;
  queuedPlayers: number;
  serverLoad: number;
  averagePing: number;
  totalRegisteredUsers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  revenue: number;
  bandwidthUsage: number;
}

// ================= WEBSOCKET & REAL-TIME TYPES =================
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: Date;
  requestId?: string;
}

export enum WebSocketMessageType {
  // Authentication
  AUTH_REQUEST = 'auth_request',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILED = 'auth_failed',
  
  // Matchmaking
  QUEUE_JOIN = 'queue_join',
  QUEUE_LEAVE = 'queue_leave',
  MATCH_FOUND = 'match_found',
  MATCH_READY_CHECK = 'match_ready_check',
  MATCH_READY_RESPONSE = 'match_ready_response',
  
  // Game events
  GAME_JOIN = 'game_join',
  GAME_LEAVE = 'game_leave',
  GAME_STATE_UPDATE = 'game_state_update',
  PLAYER_MOVE = 'player_move',
  PLAYER_ATTACK = 'player_attack',
  PLAYER_CAST_SPELL = 'player_cast_spell',
  PLAYER_USE_ITEM = 'player_use_item',
  PLAYER_DIED = 'player_died',
  PLAYER_RESPAWNED = 'player_respawned',
  
  // Chat
  CHAT_MESSAGE = 'chat_message',
  CHAT_JOIN_CHANNEL = 'chat_join_channel',
  CHAT_LEAVE_CHANNEL = 'chat_leave_channel',
  
  // Guild
  GUILD_INVITE = 'guild_invite',
  GUILD_MESSAGE = 'guild_message',
  GUILD_MEMBER_ONLINE = 'guild_member_online',
  GUILD_MEMBER_OFFLINE = 'guild_member_offline',
  
  // Friends
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ONLINE = 'friend_online',
  FRIEND_OFFLINE = 'friend_offline',
  
  // System
  SYSTEM_MESSAGE = 'system_message',
  SERVER_SHUTDOWN = 'server_shutdown',
  PING = 'ping',
  PONG = 'pong',
  ERROR = 'error'
}

// ================= ERROR & RESPONSE TYPES =================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ================= CONFIGURATION TYPES =================
export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  security: SecurityConfig;
  game: GameConfig;
  upload: UploadConfig;
  email: EmailConfig;
  analytics: AnalyticsConfig;
  antiCheat: AntiCheatConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  ssl: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface JwtConfig {
  secret: string;
  expire: string;
  refreshSecret: string;
  refreshExpire: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
  rateLimitWindow: number;
  rateLimitMaxRequests: number;
}

export interface GameConfig {
  maxPlayersPerMatch: number;
  matchDuration: number;
  lobbyTimeout: number;
  tickRate: number;
}

export interface UploadConfig {
  maxFileSize: number;
  uploadPath: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  logLevel: string;
  logRetentionDays: number;
}

export interface AntiCheatConfig {
  enabled: boolean;
  maxMovementSpeed: number;
  maxActionsPerSecond: number;
}

// ================= UTILITY TYPES =================
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type PlayerWithoutSensitiveData = Omit<Player, 'inventory' | 'economy'>;
export type UserWithoutPassword = Omit<User, 'password'>;
export type PublicPlayer = Pick<Player, 'id' | 'username' | 'displayName' | 'level' | 'characterClass' | 'isOnline'>;

// ================= EXPORT ALL TYPES =================
export * from './game';
export * from './websocket';
export * from './api';