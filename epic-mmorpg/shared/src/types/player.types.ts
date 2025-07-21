import { BaseEntity, UUID, DateString, Timestamp } from './common.types';
import { Character } from './character.types';

export interface Player extends BaseEntity {
  accountId: UUID;
  username: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  avatar?: string;
  bio?: string;
  status: PlayerStatus;
  role: PlayerRole;
  subscription: SubscriptionTier;
  subscriptionExpiresAt?: DateString;
  characters: Character[];
  activeCharacterId?: UUID;
  lastLoginAt?: DateString;
  lastActivityAt?: DateString;
  totalPlayTime: number; // in seconds
  settings: PlayerSettings;
  wallet: PlayerWallet;
  inventory: AccountInventory;
  achievements: PlayerAchievement[];
  titles: PlayerTitle[];
  collections: PlayerCollection[];
  statistics: PlayerStatistics;
  social: PlayerSocial;
  security: PlayerSecurity;
  preferences: PlayerPreferences;
  flags: PlayerFlags;
  bans: PlayerBan[];
  warnings: PlayerWarning[];
  referralCode?: string;
  referredBy?: UUID;
  referrals: UUID[];
  vipLevel: number;
  vipPoints: number;
  loyaltyPoints: number;
  premiumCurrency: number;
  dailyLoginStreak: number;
  lastDailyLogin?: DateString;
  tutorialProgress: TutorialProgress;
  marketplaceRating: number;
  marketplaceTransactions: number;
}

export enum PlayerStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Banned = 'banned',
  Deleted = 'deleted'
}

export enum PlayerRole {
  Player = 'player',
  Moderator = 'moderator',
  GameMaster = 'game_master',
  Developer = 'developer',
  Admin = 'admin'
}

export enum SubscriptionTier {
  Free = 'free',
  Basic = 'basic',
  Premium = 'premium',
  VIP = 'vip',
  Lifetime = 'lifetime'
}

export interface PlayerSettings {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  gameplay: GameplaySettings;
  graphics: GraphicsSettings;
  audio: AudioSettings;
  controls: ControlSettings;
  ui: UISettings;
  chat: ChatSettings;
}

export interface NotificationSettings {
  enableAll: boolean;
  email: {
    newsletter: boolean;
    updates: boolean;
    promotions: boolean;
    social: boolean;
    security: boolean;
  };
  push: {
    messages: boolean;
    friendRequests: boolean;
    guildInvites: boolean;
    tradeRequests: boolean;
    eventReminders: boolean;
    maintenanceAlerts: boolean;
  };
  inGame: {
    achievementUnlocks: boolean;
    levelUps: boolean;
    rareDrops: boolean;
    questCompletions: boolean;
    pvpNotifications: boolean;
    guildNotifications: boolean;
    friendActivity: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'guild' | 'private';
  showOnlineStatus: boolean;
  showLocation: boolean;
  showAchievements: boolean;
  showInventory: boolean;
  showStatistics: boolean;
  allowFriendRequests: boolean;
  allowGuildInvites: boolean;
  allowTradeRequests: boolean;
  allowDuels: boolean;
  allowWhispers: 'all' | 'friends' | 'guild' | 'none';
  blockList: UUID[];
}

export interface GameplaySettings {
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  autoLoot: boolean;
  autoQuest: boolean;
  showDamageNumbers: boolean;
  showHealthBars: boolean;
  showNameplates: boolean;
  showMinimap: boolean;
  showQuestMarkers: boolean;
  combatLogVerbosity: 'minimal' | 'normal' | 'detailed';
  cameraMode: 'fixed' | 'follow' | 'free';
  cameraDistance: number;
  fieldOfView: number;
  mouseSensitivity: number;
  invertMouse: boolean;
  enableVibration: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // minutes
}

export interface GraphicsSettings {
  resolution: string;
  fullscreen: boolean;
  vsync: boolean;
  antiAliasing: 'off' | 'fxaa' | 'msaa2x' | 'msaa4x' | 'msaa8x';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  shadowQuality: 'off' | 'low' | 'medium' | 'high' | 'ultra';
  effectsQuality: 'low' | 'medium' | 'high' | 'ultra';
  viewDistance: number;
  particleDensity: number;
  postProcessing: boolean;
  bloom: boolean;
  motionBlur: boolean;
  ambientOcclusion: boolean;
  reflections: boolean;
  waterQuality: 'low' | 'medium' | 'high';
  grassDensity: number;
  crowdDensity: number;
  maxFPS: number;
  renderScale: number;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  ambientVolume: number;
  voiceVolume: number;
  uiVolume: number;
  enableMusic: boolean;
  enableEffects: boolean;
  enableAmbient: boolean;
  enableVoice: boolean;
  enable3DAudio: boolean;
  audioQuality: 'low' | 'medium' | 'high';
  voiceChatMode: 'push-to-talk' | 'voice-activated' | 'off';
  voiceActivationThreshold: number;
  outputDevice?: string;
  inputDevice?: string;
}

export interface ControlSettings {
  keyBindings: KeyBindings;
  gamepadBindings?: GamepadBindings;
  mouseBindings: MouseBindings;
  useGamepad: boolean;
  gamepadDeadzone: number;
  gamepadVibration: boolean;
}

export interface KeyBindings {
  [action: string]: string; // action -> key code
}

export interface GamepadBindings {
  [action: string]: string; // action -> button
}

export interface MouseBindings {
  [action: string]: number; // action -> mouse button
}

export interface UISettings {
  scale: number;
  opacity: number;
  colorBlindMode: 'off' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  showFPS: boolean;
  showPing: boolean;
  showClock: boolean;
  showCoordinates: boolean;
  minimapSize: number;
  minimapOpacity: number;
  chatOpacity: number;
  chatFontSize: number;
  subtitles: boolean;
  subtitleSize: number;
  hotbarLayout: HotbarLayout;
  windowPositions: WindowPositions;
}

export interface HotbarLayout {
  rows: number;
  columns: number;
  size: number;
  locked: boolean;
  bindings: { [slot: string]: string };
}

export interface WindowPositions {
  [windowId: string]: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    minimized?: boolean;
  };
}

export interface ChatSettings {
  fontSize: number;
  opacity: number;
  fadeTime: number;
  maxMessages: number;
  timestamps: boolean;
  channelColors: { [channel: string]: string };
  filters: ChatFilters;
  tabs: ChatTab[];
  activeTab: string;
}

export interface ChatFilters {
  profanity: boolean;
  spam: boolean;
  tradeLinking: boolean;
  emoticons: boolean;
}

export interface ChatTab {
  id: string;
  name: string;
  channels: string[];
  filters: string[];
}

export interface PlayerWallet {
  gold: number;
  silver: number;
  copper: number;
  gems: number; // premium currency
  tokens: CurrencyToken[];
  cryptoWallets?: CryptoWallet[];
}

export interface CurrencyToken {
  type: string;
  amount: number;
  boundTo?: 'character' | 'account';
}

export interface CryptoWallet {
  address: string;
  type: 'ethereum' | 'bitcoin' | 'polygon';
  balance?: number;
  verified: boolean;
}

export interface AccountInventory {
  slots: number;
  items: AccountItem[];
  bank: BankVault[];
  collections: CollectionStorage;
  consumables: ConsumableStorage;
}

export interface AccountItem {
  id: UUID;
  itemId: string;
  quantity: number;
  boundTo: 'account';
  obtainedAt: DateString;
  source?: string;
}

export interface BankVault {
  id: UUID;
  name: string;
  slots: number;
  items: AccountItem[];
  accessLevel: 'personal' | 'shared';
  sharedWith?: UUID[]; // character IDs
}

export interface CollectionStorage {
  mounts: UUID[];
  pets: UUID[];
  toys: UUID[];
  transmogs: UUID[];
  titles: UUID[];
  achievements: UUID[];
}

export interface ConsumableStorage {
  boosts: ConsumableItem[];
  tickets: ConsumableItem[];
  keys: ConsumableItem[];
}

export interface ConsumableItem {
  id: UUID;
  type: string;
  quantity: number;
  expiresAt?: DateString;
}

export interface PlayerAchievement {
  id: UUID;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: DateString;
  criteria: AchievementCriteria[];
  rewardsClaimed: boolean;
}

export interface AchievementCriteria {
  id: string;
  progress: number;
  target: number;
  completed: boolean;
}

export interface PlayerTitle {
  id: UUID;
  titleId: string;
  unlockedAt: DateString;
  source: string;
  active: boolean;
  prefix?: boolean;
}

export interface PlayerCollection {
  id: UUID;
  type: CollectionType;
  items: CollectionItem[];
  progress: number;
  completed: boolean;
  rewards?: CollectionReward[];
}

export enum CollectionType {
  Cards = 'cards',
  Badges = 'badges',
  Trophies = 'trophies',
  Artifacts = 'artifacts',
  Lore = 'lore',
  Recipes = 'recipes',
  Music = 'music',
  Artwork = 'artwork'
}

export interface CollectionItem {
  id: string;
  obtained: boolean;
  obtainedAt?: DateString;
  quantity?: number;
  variant?: string;
}

export interface CollectionReward {
  tier: number;
  claimed: boolean;
  rewards: any[];
}

export interface PlayerStatistics {
  general: GeneralStatistics;
  combat: CombatStatistics;
  economic: EconomicStatistics;
  social: SocialStatistics;
  exploration: ExplorationStatistics;
  crafting: CraftingStatistics;
  pvp: PvPStatistics;
  pve: PvEStatistics;
  seasonal: SeasonalStatistics[];
}

export interface GeneralStatistics {
  totalPlayTime: number;
  charactersCreated: number;
  charactersDeleted: number;
  totalDeaths: number;
  totalRevives: number;
  questsCompleted: number;
  achievementsUnlocked: number;
  titlesUnlocked: number;
  mountsCollected: number;
  petsCollected: number;
  toysCollected: number;
  highestLevel: number;
  fastestLevelTime: number;
}

export interface CombatStatistics {
  totalKills: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealingDone: number;
  totalHealingReceived: number;
  criticalStrikes: number;
  dodges: number;
  parries: number;
  blocks: number;
  highestDamage: number;
  highestHealing: number;
  longestKillStreak: number;
}

export interface EconomicStatistics {
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalItemsSold: number;
  totalItemsBought: number;
  totalItemsCrafted: number;
  totalItemsDestroyed: number;
  auctionsSold: number;
  auctionsBought: number;
  highestSale: number;
  totalTradingProfit: number;
}

export interface SocialStatistics {
  friendsMade: number;
  guildsJoined: number;
  guildsCreated: number;
  messagesSent: number;
  emotesUsed: number;
  partiesJoined: number;
  raidsCompleted: number;
  dungeonsCompleted: number;
  helpfulVotes: number;
  reportsMade: number;
}

export interface ExplorationStatistics {
  zonesDiscovered: number;
  totalZones: number;
  waypointsUnlocked: number;
  totalWaypoints: number;
  treasuresFound: number;
  secretsDiscovered: number;
  loreCollected: number;
  viewsDiscovered: number;
  totalDistance: number;
  flightPaths: number;
}

export interface CraftingStatistics {
  recipesLearned: number;
  itemsCrafted: number;
  perfectCrafts: number;
  materialsGathered: number;
  professionsMaxed: number;
  rareCrafts: number;
  epicCrafts: number;
  legendaryCrafts: number;
  totalCraftingXP: number;
}

export interface PvPStatistics {
  kills: number;
  deaths: number;
  assists: number;
  kdRatio: number;
  winRate: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  highestRating: number;
  rank: string;
  highestRank: string;
  honorPoints: number;
  conquestPoints: number;
  killStreaks: number;
  multiKills: number;
  territories: number;
  objectives: number;
}

export interface PvEStatistics {
  mobsKilled: number;
  eliteKills: number;
  bossKills: number;
  worldBossKills: number;
  dungeonsCompleted: number;
  raidsCompleted: number;
  heroicCompleted: number;
  mythicCompleted: number;
  speedruns: number;
  flawlessRuns: number;
  soloKills: number;
  firstKills: number;
}

export interface SeasonalStatistics {
  seasonId: string;
  startDate: DateString;
  endDate?: DateString;
  level: number;
  experience: number;
  rank?: number;
  rewards: SeasonalReward[];
  challenges: SeasonalChallenge[];
  participation: number;
}

export interface SeasonalReward {
  tier: number;
  claimed: boolean;
  rewards: any[];
}

export interface SeasonalChallenge {
  id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerSocial {
  friends: Friend[];
  blocked: UUID[];
  followers: UUID[];
  following: UUID[];
  recentPlayers: RecentPlayer[];
  socialScore: number;
  reputation: PlayerReputation;
  endorsements: PlayerEndorsement[];
}

export interface Friend {
  playerId: UUID;
  addedAt: DateString;
  note?: string;
  favorite: boolean;
  status: FriendStatus;
  lastInteraction?: DateString;
}

export enum FriendStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Declined = 'declined',
  Blocked = 'blocked'
}

export interface RecentPlayer {
  playerId: UUID;
  encounteredAt: DateString;
  activity: string;
  interaction: 'positive' | 'neutral' | 'negative';
}

export interface PlayerReputation {
  overall: number;
  helpful: number;
  friendly: number;
  skilled: number;
  trustworthy: number;
  totalVotes: number;
}

export interface PlayerEndorsement {
  fromPlayerId: UUID;
  type: EndorsementType;
  message?: string;
  createdAt: DateString;
}

export enum EndorsementType {
  Helpful = 'helpful',
  Friendly = 'friendly',
  Skilled = 'skilled',
  Leader = 'leader',
  Teacher = 'teacher',
  TeamPlayer = 'team_player'
}

export interface PlayerSecurity {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'app' | 'sms' | 'email';
  securityQuestions: SecurityQuestion[];
  loginHistory: LoginRecord[];
  devices: TrustedDevice[];
  apiKeys: APIKey[];
  passwordChangedAt?: DateString;
  emailChangedAt?: DateString;
  phoneNumber?: string;
  phoneVerified: boolean;
  recoveryEmail?: string;
  ipWhitelist: string[];
  vpnAllowed: boolean;
}

export interface SecurityQuestion {
  id: UUID;
  question: string;
  answerHash: string;
  createdAt: DateString;
}

export interface LoginRecord {
  id: UUID;
  ip: string;
  location?: string;
  device: string;
  success: boolean;
  timestamp: DateString;
  suspicious: boolean;
}

export interface TrustedDevice {
  id: UUID;
  name: string;
  type: string;
  fingerprint: string;
  lastUsed: DateString;
  trusted: boolean;
}

export interface APIKey {
  id: UUID;
  name: string;
  key: string;
  permissions: string[];
  expiresAt?: DateString;
  lastUsed?: DateString;
  createdAt: DateString;
}

export interface PlayerPreferences {
  characterSlots: number;
  bankSlots: number;
  auctionSlots: number;
  mailboxSize: number;
  friendsListSize: number;
  ignoreListSize: number;
  customEmotes: CustomEmote[];
  macros: Macro[];
  savedLayouts: SavedLayout[];
  bookmarks: Bookmark[];
}

export interface CustomEmote {
  id: UUID;
  command: string;
  text: string;
  animation?: string;
}

export interface Macro {
  id: UUID;
  name: string;
  icon: string;
  commands: string[];
  keybind?: string;
}

export interface SavedLayout {
  id: UUID;
  name: string;
  type: 'ui' | 'hotbar' | 'both';
  data: any;
}

export interface Bookmark {
  id: UUID;
  type: 'location' | 'npc' | 'item' | 'quest';
  targetId: string;
  name: string;
  note?: string;
}

export interface PlayerFlags {
  isVeteran: boolean;
  isBetaTester: boolean;
  isContentCreator: boolean;
  isPartner: boolean;
  isVerified: boolean;
  hasLegacyRewards: boolean;
  hasFoundersPack: boolean;
  hasLifetimePass: boolean;
  canStreamMode: boolean;
  canModerate: boolean;
  canAccessPTR: boolean;
  exemptFromQueues: boolean;
  prioritySupport: boolean;
}

export interface PlayerBan {
  id: UUID;
  reason: string;
  issuedBy: UUID;
  issuedAt: DateString;
  expiresAt?: DateString;
  permanent: boolean;
  type: BanType;
  appealable: boolean;
  appealed: boolean;
  appealResult?: 'pending' | 'approved' | 'denied';
}

export enum BanType {
  Account = 'account',
  Character = 'character',
  Chat = 'chat',
  Trade = 'trade',
  Mail = 'mail',
  Auction = 'auction',
  Forum = 'forum'
}

export interface PlayerWarning {
  id: UUID;
  reason: string;
  issuedBy: UUID;
  issuedAt: DateString;
  severity: 'minor' | 'moderate' | 'major';
  acknowledged: boolean;
  acknowledgedAt?: DateString;
}

export interface TutorialProgress {
  completed: string[];
  skipped: string[];
  current?: string;
  hints: { [key: string]: boolean };
  tooltips: { [key: string]: boolean };
}

// Session-related types
export interface PlayerSession {
  id: UUID;
  playerId: UUID;
  characterId?: UUID;
  token: string;
  refreshToken: string;
  ip: string;
  userAgent: string;
  startedAt: DateString;
  lastActivity: DateString;
  expiresAt: DateString;
  location?: SessionLocation;
  metrics: SessionMetrics;
}

export interface SessionLocation {
  worldId: string;
  zoneId: string;
  position: { x: number; y: number; z: number };
  instance?: string;
}

export interface SessionMetrics {
  ping: number;
  fps: number;
  packetsLost: number;
  bandwidth: {
    upload: number;
    download: number;
  };
}