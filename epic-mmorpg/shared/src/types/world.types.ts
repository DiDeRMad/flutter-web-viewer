import { BaseEntity, UUID, DateString, Vector3, Box, Sphere, LocalizedString, Coordinates3D, Color, Range, WeightedItem } from './common.types';
import { Weather, TimeOfDay, Season } from './environment.types';

// World and Zone Types
export interface World extends BaseEntity {
  name: LocalizedString;
  description: LocalizedString;
  type: WorldType;
  regions: Region[];
  continents: Continent[];
  dimensions: Dimension[];
  servers: Server[];
  instances: Instance[];
  globalEvents: GlobalEvent[];
  weather: WeatherSystem;
  dayNightCycle: DayNightCycle;
  seasons: SeasonSystem;
  worldBosses: WorldBoss[];
  worldQuests: WorldQuest[];
  invasions: Invasion[];
  portals: Portal[];
  leyLines: LeyLine[];
  worldTree: WorldTree;
  lore: WorldLore;
  timeline: Timeline;
  factions: Faction[];
  languages: Language[];
  calendar: Calendar;
  economy: WorldEconomy;
  politics: WorldPolitics;
  history: HistoricalEvent[];
  prophecies: Prophecy[];
  cosmology: Cosmology;
  physics: WorldPhysics;
  magic: MagicSystem;
}

export enum WorldType {
  Primary = 'primary',
  Mirror = 'mirror',
  Pocket = 'pocket',
  Dream = 'dream',
  Shadow = 'shadow',
  Elemental = 'elemental',
  Digital = 'digital',
  Quantum = 'quantum'
}

export interface Region extends BaseEntity {
  name: LocalizedString;
  description: LocalizedString;
  continentId: UUID;
  zones: Zone[];
  climate: Climate;
  terrain: TerrainType[];
  biomes: Biome[];
  borders: RegionBorder[];
  capital?: City;
  settlements: Settlement[];
  pointsOfInterest: PointOfInterest[];
  resources: RegionalResource[];
  wildlife: Wildlife[];
  threats: RegionalThreat[];
  governance: Governance;
  culture: Culture;
  trade: TradeRoute[];
  conflicts: Conflict[];
  landmarks: Landmark[];
}

export interface Continent extends BaseEntity {
  name: LocalizedString;
  description: LocalizedString;
  worldId: UUID;
  regions: UUID[];
  size: number; // square kilometers
  population: number;
  shape: ContinentShape;
  elevation: ElevationMap;
  coastline: Coastline;
  islands: Island[];
  mountainRanges: MountainRange[];
  rivers: River[];
  lakes: Lake[];
  forests: Forest[];
  deserts: Desert[];
  tundras: Tundra[];
  dominantFactions: UUID[];
  ancientRuins: AncientRuin[];
  naturalWonders: NaturalWonder[];
  cataclysms: Cataclysm[];
}

export interface Zone extends BaseEntity {
  name: LocalizedString;
  description: LocalizedString;
  regionId: UUID;
  level: LevelRange;
  type: ZoneType;
  subZones: SubZone[];
  areas: Area[];
  terrain: TerrainData;
  bounds: ZoneBounds;
  spawns: SpawnPoint[];
  graveyards: Graveyard[];
  flightPaths: FlightPath[];
  waypoints: Waypoint[];
  quests: UUID[];
  npcs: UUID[];
  creatures: CreatureSpawn[];
  objects: ObjectSpawn[];
  resources: ResourceNode[];
  events: ZoneEvent[];
  weather: ZoneWeather;
  music: ZoneMusic;
  ambience: ZoneAmbience;
  lighting: ZoneLighting;
  fog: FogSettings;
  skybox: string;
  minimapData: MinimapData;
  discovery: DiscoveryData;
  pvpRules: PvPRules;
  sanctuary: boolean;
  contested: boolean;
  instancePortals: InstancePortal[];
  worldPortals: WorldPortal[];
  triggers: ZoneTrigger[];
  scripts: ZoneScript[];
  phases: ZonePhase[];
  layers: ZoneLayer[];
  ownership: ZoneOwnership;
  taxation: TaxationData;
  laws: ZoneLaw[];
  guards: GuardData;
  services: ZoneService[];
}

export enum ZoneType {
  Starter = 'starter',
  Low = 'low',
  Mid = 'mid',
  High = 'high',
  Max = 'max',
  City = 'city',
  Dungeon = 'dungeon',
  Raid = 'raid',
  Battleground = 'battleground',
  Arena = 'arena',
  Scenario = 'scenario',
  Island = 'island',
  Warfront = 'warfront',
  Housing = 'housing',
  Guild = 'guild',
  Event = 'event',
  Tutorial = 'tutorial',
  Instanced = 'instanced',
  Phased = 'phased',
  Sanctuary = 'sanctuary',
  Contested = 'contested',
  Neutral = 'neutral'
}

export interface SubZone extends BaseEntity {
  name: LocalizedString;
  zoneId: UUID;
  boundaries: Boundary[];
  areas: UUID[];
  type: SubZoneType;
  ownership?: UUID; // faction or guild
  capturable: boolean;
  objectives: Objective[];
  bonuses: SubZoneBonus[];
  restrictions: AccessRestriction[];
}

export enum SubZoneType {
  Town = 'town',
  Outpost = 'outpost',
  Camp = 'camp',
  Fort = 'fort',
  Tower = 'tower',
  Mine = 'mine',
  Farm = 'farm',
  Harbor = 'harbor',
  Graveyard = 'graveyard',
  Battlefield = 'battlefield',
  Ruins = 'ruins',
  Cave = 'cave',
  Forest = 'forest',
  Lake = 'lake',
  Mountain = 'mountain',
  Valley = 'valley',
  Desert = 'desert',
  Swamp = 'swamp',
  Tundra = 'tundra',
  Volcano = 'volcano'
}

export interface Area {
  id: UUID;
  name: LocalizedString;
  polygon: Vector3[];
  height: Range;
  type: AreaType;
  flags: AreaFlag[];
  effects: AreaEffect[];
  triggers: AreaTrigger[];
  restrictions: AreaRestriction[];
}

export enum AreaType {
  Safe = 'safe',
  Combat = 'combat',
  Social = 'social',
  Quest = 'quest',
  Event = 'event',
  Hidden = 'hidden',
  Restricted = 'restricted',
  Phased = 'phased'
}

export interface AreaFlag {
  type: AreaFlagType;
  value: any;
}

export enum AreaFlagType {
  NoPvP = 'no_pvp',
  NoMount = 'no_mount',
  NoFly = 'no_fly',
  NoPet = 'no_pet',
  Sanctuary = 'sanctuary',
  Rested = 'rested',
  Silence = 'silence',
  Teleport = 'teleport',
  Duel = 'duel',
  FFA = 'ffa' // free for all
}

export interface TerrainData {
  heightmap: HeightMap;
  textures: TerrainTexture[];
  vegetation: VegetationData;
  water: WaterData;
  cliffs: CliffData[];
  paths: PathData[];
  obstacles: ObstacleData[];
}

export interface HeightMap {
  width: number;
  height: number;
  scale: number;
  data: Float32Array;
  resolution: number;
}

export interface TerrainTexture {
  id: string;
  diffuse: string;
  normal: string;
  specular?: string;
  displacement?: string;
  tiling: number;
  blendMap?: string;
}

export interface ZoneBounds {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  radius: number;
  shape: BoundaryShape;
  vertices?: Vector3[];
}

export enum BoundaryShape {
  Box = 'box',
  Sphere = 'sphere',
  Cylinder = 'cylinder',
  Polygon = 'polygon',
  Mesh = 'mesh'
}

export interface SpawnPoint {
  id: UUID;
  position: Vector3;
  rotation: number;
  type: SpawnType;
  factionId?: UUID;
  classRestrictions?: string[];
  raceRestrictions?: string[];
  levelRestrictions?: LevelRange;
  radius: number;
  priority: number;
  conditions: SpawnCondition[];
}

export enum SpawnType {
  Default = 'default',
  Graveyard = 'graveyard',
  Instance = 'instance',
  Battleground = 'battleground',
  Arena = 'arena',
  Event = 'event',
  Quest = 'quest',
  Hearthstone = 'hearthstone'
}

export interface Graveyard {
  id: UUID;
  name: LocalizedString;
  position: Vector3;
  factionId?: UUID;
  range: number;
  spiritHealerNpcId?: string;
  resurrectPosition: Vector3;
  ghostAreaId?: UUID;
}

export interface FlightPath {
  id: UUID;
  startNode: FlightNode;
  endNode: FlightNode;
  waypoints: FlightWaypoint[];
  cost: FlightCost;
  duration: number;
  mountModelOverride?: string;
  requirements: FlightRequirement[];
  scenic: boolean;
}

export interface FlightNode {
  id: UUID;
  name: LocalizedString;
  position: Vector3;
  npcId: string;
  factionId?: UUID;
  connections: UUID[];
  discovered: boolean;
  taxiType: TaxiType;
}

export enum TaxiType {
  Normal = 'normal',
  Fast = 'fast',
  Scenic = 'scenic',
  Combat = 'combat',
  Special = 'special'
}

export interface Waypoint {
  id: UUID;
  name: LocalizedString;
  position: Vector3;
  icon: string;
  unlocked: boolean;
  requirements: WaypointRequirement[];
  linkedWaypoints: UUID[];
  portalType: PortalType;
  destination?: PortalDestination;
  cooldown?: number;
  cost?: WaypointCost;
}

export interface CreatureSpawn {
  id: UUID;
  creatureId: string;
  position: Vector3;
  rotation: number;
  spawnGroup?: UUID;
  respawnTime: number;
  wanderRadius: number;
  patrolPath?: PatrolPath;
  behavior: CreatureBehavior;
  leashRadius: number;
  callForHelp: boolean;
  phaseId?: UUID;
  conditions: SpawnCondition[];
  lootTableId?: string;
  questGiver?: boolean;
  vendor?: boolean;
  trainer?: boolean;
  flightMaster?: boolean;
  innkeeper?: boolean;
  banker?: boolean;
  auctioneer?: boolean;
  stablemaster?: boolean;
  battlemaster?: boolean;
  guildmaster?: boolean;
  gossip?: GossipData;
}

export interface PatrolPath {
  id: UUID;
  waypoints: PatrolWaypoint[];
  loop: boolean;
  pauseAtWaypoints: boolean;
  randomize: boolean;
  formation?: Formation;
}

export interface PatrolWaypoint {
  position: Vector3;
  waitTime: number;
  animation?: string;
  script?: string;
}

export interface Formation {
  type: FormationType;
  spacing: number;
  angle: number;
  follow: boolean;
}

export enum FormationType {
  Line = 'line',
  Column = 'column',
  Wedge = 'wedge',
  Circle = 'circle',
  Square = 'square',
  Diamond = 'diamond'
}

export interface ObjectSpawn {
  id: UUID;
  objectId: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  type: ObjectType;
  respawnTime: number;
  interactDistance: number;
  phaseId?: UUID;
  questId?: UUID;
  lootTableId?: string;
  trapData?: TrapData;
  doorData?: DoorData;
  transportData?: TransportData;
  captureData?: CaptureData;
  conditions: SpawnCondition[];
}

export enum ObjectType {
  Static = 'static',
  Interactive = 'interactive',
  Container = 'container',
  Gathering = 'gathering',
  Quest = 'quest',
  Door = 'door',
  Trap = 'trap',
  Transport = 'transport',
  Capture = 'capture',
  Destructible = 'destructible',
  Siege = 'siege',
  Portal = 'portal',
  Mailbox = 'mailbox',
  AuctionHouse = 'auction_house',
  Bank = 'bank',
  GuildBank = 'guild_bank',
  Meeting = 'meeting',
  Fishing = 'fishing'
}

export interface ResourceNode {
  id: UUID;
  type: ResourceType;
  tier: number;
  position: Vector3;
  respawnTime: number;
  charges: number;
  skillRequired: number;
  tools: string[];
  yield: ResourceYield[];
  bonusConditions: BonusCondition[];
  depletedModel?: string;
  phaseId?: UUID;
}

export enum ResourceType {
  Ore = 'ore',
  Herb = 'herb',
  Leather = 'leather',
  Cloth = 'cloth',
  Wood = 'wood',
  Fish = 'fish',
  Gem = 'gem',
  Essence = 'essence',
  Energy = 'energy',
  Artifact = 'artifact'
}

export interface ResourceYield {
  itemId: string;
  min: number;
  max: number;
  chance: number;
  bonusSkillChance?: number;
}

export interface ZoneEvent {
  id: UUID;
  name: LocalizedString;
  description: LocalizedString;
  type: EventType;
  schedule: EventSchedule;
  duration: number;
  phases: EventPhase[];
  rewards: EventReward[];
  participants: EventParticipant[];
  objectives: EventObjective[];
  scaling: EventScaling;
  announcement: EventAnnouncement;
}

export enum EventType {
  Invasion = 'invasion',
  WorldBoss = 'world_boss',
  Seasonal = 'seasonal',
  Story = 'story',
  PvP = 'pvp',
  Collection = 'collection',
  Race = 'race',
  Defense = 'defense',
  Assault = 'assault',
  Puzzle = 'puzzle',
  Social = 'social',
  Economic = 'economic'
}

export interface EventSchedule {
  type: ScheduleType;
  startTime?: DateString;
  endTime?: DateString;
  recurrence?: Recurrence;
  triggers?: EventTrigger[];
}

export enum ScheduleType {
  OneTime = 'one_time',
  Recurring = 'recurring',
  Triggered = 'triggered',
  Random = 'random',
  Continuous = 'continuous'
}

export interface Dimension extends BaseEntity {
  name: LocalizedString;
  description: LocalizedString;
  type: DimensionType;
  accessPoints: DimensionPortal[];
  rules: DimensionRules;
  inhabitants: DimensionInhabitant[];
  environment: DimensionEnvironment;
  magic: DimensionMagic;
  physics: DimensionPhysics;
  threats: DimensionThreat[];
  resources: DimensionResource[];
  history: DimensionHistory;
}

export enum DimensionType {
  Material = 'material',
  Ethereal = 'ethereal',
  Shadow = 'shadow',
  Dream = 'dream',
  Elemental = 'elemental',
  Void = 'void',
  Mirror = 'mirror',
  Pocket = 'pocket',
  Temporal = 'temporal',
  Digital = 'digital'
}

export interface Instance extends BaseEntity {
  name: LocalizedString;
  description: LocalizedString;
  type: InstanceType;
  parentZoneId: UUID;
  difficulty: InstanceDifficulty[];
  size: InstanceSize;
  minLevel: number;
  maxLevel: number;
  maxPlayers: number;
  minPlayers: number;
  layout: InstanceLayout;
  encounters: Encounter[];
  trash: TrashPack[];
  mechanics: InstanceMechanic[];
  timers: InstanceTimer[];
  checkpoints: Checkpoint[];
  loot: LootTable[];
  achievements: InstanceAchievement[];
  lockout: LockoutInfo;
  modifiers: InstanceModifier[];
  scaling: InstanceScaling;
  story: InstanceStory;
}

export enum InstanceType {
  Dungeon = 'dungeon',
  Raid = 'raid',
  Scenario = 'scenario',
  Arena = 'arena',
  Battleground = 'battleground',
  Island = 'island',
  Warfront = 'warfront',
  Delve = 'delve',
  Torghast = 'torghast',
  Vision = 'vision'
}

export enum InstanceDifficulty {
  Story = 'story',
  Normal = 'normal',
  Heroic = 'heroic',
  Mythic = 'mythic',
  MythicPlus = 'mythic_plus',
  Timewalking = 'timewalking',
  Challenge = 'challenge'
}

export enum InstanceSize {
  Solo = 'solo',
  Small = 'small', // 5 players
  Medium = 'medium', // 10 players
  Large = 'large', // 20-25 players
  Massive = 'massive', // 40+ players
  Scalable = 'scalable'
}

export interface InstanceLayout {
  wings: Wing[];
  floors: Floor[];
  rooms: Room[];
  corridors: Corridor[];
  secrets: SecretArea[];
  shortcuts: Shortcut[];
  teleporters: Teleporter[];
  obstacles: Obstacle[];
  traps: Trap[];
  puzzles: Puzzle[];
}

export interface Encounter {
  id: UUID;
  name: LocalizedString;
  bossIds: string[];
  type: EncounterType;
  phases: BossPhase[];
  mechanics: BossMechanic[];
  abilities: BossAbility[];
  positioning: PositioningRequirement[];
  timers: EncounterTimer[];
  enrage: EnrageTimer;
  loot: BossLoot[];
  achievements: BossAchievement[];
  difficulty: DifficultyScaling;
  order: number;
  optional: boolean;
  hidden: boolean;
  activation: EncounterActivation;
  reset: ResetCondition[];
  deathLimit?: number;
}

export enum EncounterType {
  Boss = 'boss',
  MiniBoss = 'mini_boss',
  Council = 'council',
  Gauntlet = 'gauntlet',
  Survival = 'survival',
  Puzzle = 'puzzle',
  Race = 'race',
  DPS = 'dps',
  Heal = 'heal',
  Tank = 'tank',
  Multi = 'multi'
}

export interface GlobalEvent extends BaseEntity {
  name: LocalizedString;
  description: LocalizedString;
  type: GlobalEventType;
  startTime: DateString;
  endTime: DateString;
  affectedZones: UUID[];
  worldChanges: WorldChange[];
  questChains: UUID[];
  vendors: EventVendor[];
  activities: EventActivity[];
  rewards: GlobalEventReward[];
  leaderboards: EventLeaderboard[];
  phases: GlobalEventPhase[];
  progression: EventProgression;
  currency: EventCurrency;
}

export enum GlobalEventType {
  Seasonal = 'seasonal',
  Holiday = 'holiday',
  Anniversary = 'anniversary',
  Expansion = 'expansion',
  PrePatch = 'pre_patch',
  Invasion = 'invasion',
  Cataclysm = 'cataclysm',
  War = 'war',
  Tournament = 'tournament',
  Festival = 'festival'
}

export interface WorldBoss {
  id: UUID;
  name: LocalizedString;
  title: LocalizedString;
  level: number;
  health: number;
  spawnLocations: SpawnLocation[];
  abilities: WorldBossAbility[];
  phases: WorldBossPhase[];
  loot: WorldBossLoot;
  spawn: WorldBossSpawn;
  mechanics: WorldBossMechanic[];
  achievements: UUID[];
  requiredPlayers: number;
  softEnrage: number;
  hardEnrage: number;
  immunities: Immunity[];
  resistances: Resistance[];
  auras: BossAura[];
}

export interface SpawnLocation {
  zoneId: UUID;
  position: Vector3;
  territorySize: number;
  announcement: boolean;
}

export interface WorldBossSpawn {
  schedule: SpawnSchedule;
  conditions: SpawnCondition[];
  despawnTimer: number;
  respawnTimer: number;
  sharedSpawn: boolean;
  maxConcurrent: number;
}

export interface SpawnSchedule {
  type: 'fixed' | 'window' | 'random' | 'triggered';
  times?: DateString[];
  window?: { start: number; end: number };
  chance?: number;
  triggers?: string[];
}

export interface Portal {
  id: UUID;
  name: LocalizedString;
  type: PortalType;
  source: PortalEndpoint;
  destination: PortalEndpoint;
  bidirectional: boolean;
  requirements: PortalRequirement[];
  cost: PortalCost;
  cooldown: number;
  animation: PortalAnimation;
  effects: PortalEffect[];
  stability: number;
  dangerous: boolean;
}

export enum PortalType {
  Permanent = 'permanent',
  Temporary = 'temporary',
  Player = 'player',
  Raid = 'raid',
  Dungeon = 'dungeon',
  City = 'city',
  Summoning = 'summoning',
  Recall = 'recall',
  Random = 'random',
  Unstable = 'unstable'
}

export interface PortalEndpoint {
  worldId?: UUID;
  zoneId: UUID;
  position: Vector3;
  orientation: number;
  phaseId?: UUID;
}

export interface LeyLine {
  id: UUID;
  name: LocalizedString;
  nodes: LeyNode[];
  connections: LeyConnection[];
  power: number;
  element: ElementType;
  corrupted: boolean;
  guardians: UUID[];
  effects: LeyLineEffect[];
  convergences: LeyConvergence[];
}

export interface LeyNode {
  id: UUID;
  position: Vector3;
  power: number;
  stability: number;
  tapped: boolean;
  controller?: UUID;
}

export interface Settlement {
  id: UUID;
  name: LocalizedString;
  type: SettlementType;
  population: number;
  size: SettlementSize;
  position: Vector3;
  boundaries: Boundary[];
  districts: District[];
  buildings: Building[];
  services: Service[];
  npcs: UUID[];
  governance: SettlementGovernance;
  economy: SettlementEconomy;
  defense: SettlementDefense;
  reputation: UUID;
  culture: UUID;
  trade: UUID[];
  threats: UUID[];
  quests: UUID[];
  events: UUID[];
}

export enum SettlementType {
  City = 'city',
  Town = 'town',
  Village = 'village',
  Outpost = 'outpost',
  Fort = 'fort',
  Camp = 'camp',
  Trading = 'trading',
  Port = 'port',
  Sanctuary = 'sanctuary',
  Ruins = 'ruins'
}

export enum SettlementSize {
  Hamlet = 'hamlet',
  Village = 'village',
  Town = 'town',
  City = 'city',
  Capital = 'capital',
  Metropolis = 'metropolis'
}

export interface District {
  id: UUID;
  name: LocalizedString;
  type: DistrictType;
  boundaries: Boundary[];
  buildings: UUID[];
  population: number;
  wealth: number;
  crime: number;
  services: UUID[];
  specialization?: string;
  restrictions: DistrictRestriction[];
}

export enum DistrictType {
  Residential = 'residential',
  Commercial = 'commercial',
  Industrial = 'industrial',
  Noble = 'noble',
  Slums = 'slums',
  Harbor = 'harbor',
  Market = 'market',
  Temple = 'temple',
  Military = 'military',
  Arcane = 'arcane',
  Garden = 'garden',
  Entertainment = 'entertainment'
}

export interface Building {
  id: UUID;
  name: LocalizedString;
  type: BuildingType;
  model: string;
  position: Vector3;
  rotation: number;
  floors: number;
  condition: number;
  owner?: UUID;
  occupants: UUID[];
  services: UUID[];
  storage?: Storage;
  upgrades: BuildingUpgrade[];
  damage: number;
  repairCost: number;
  maintenanceCost: number;
  revenue?: number;
}

export enum BuildingType {
  House = 'house',
  Shop = 'shop',
  Inn = 'inn',
  Tavern = 'tavern',
  Bank = 'bank',
  Auction = 'auction',
  Stable = 'stable',
  Barracks = 'barracks',
  Temple = 'temple',
  Library = 'library',
  Tower = 'tower',
  Wall = 'wall',
  Gate = 'gate',
  Market = 'market',
  Warehouse = 'warehouse',
  Workshop = 'workshop',
  Guild = 'guild',
  Arena = 'arena',
  Theater = 'theater',
  Palace = 'palace'
}

// Additional types for world physics, weather, economy etc.
export interface WorldPhysics {
  gravity: number;
  airDensity: number;
  waterDensity: number;
  magicDensity: number;
  timeFlow: number;
  dimensionalStability: number;
  elementalBalance: ElementalBalance;
  naturalLaws: NaturalLaw[];
  anomalies: PhysicsAnomaly[];
}

export interface MagicSystem {
  sources: MagicSource[];
  schools: MagicSchool[];
  leyLines: UUID[];
  nodes: MagicNode[];
  restrictions: MagicRestriction[];
  corruption: MagicCorruption;
  balance: MagicBalance;
  artifacts: UUID[];
  rituals: Ritual[];
  enchantments: GlobalEnchantment[];
}

export interface WorldEconomy {
  currencies: Currency[];
  exchangeRates: ExchangeRate[];
  markets: Market[];
  tradeRoutes: TradeRoute[];
  resources: EconomicResource[];
  inflation: number;
  gdp: number;
  tradingPosts: TradingPost[];
  blackMarkets: BlackMarket[];
  economicEvents: EconomicEvent[];
  regulations: EconomicRegulation[];
}

export interface Climate {
  type: ClimateType;
  temperature: Range;
  humidity: Range;
  precipitation: number;
  windPatterns: WindPattern[];
  storms: StormType[];
  seasons: SeasonalVariation[];
}

export enum ClimateType {
  Arctic = 'arctic',
  Subarctic = 'subarctic',
  Temperate = 'temperate',
  Subtropical = 'subtropical',
  Tropical = 'tropical',
  Arid = 'arid',
  Mediterranean = 'mediterranean',
  Oceanic = 'oceanic',
  Continental = 'continental',
  Magical = 'magical'
}

export interface TerrainType {
  name: string;
  movementSpeed: number;
  visibility: number;
  cover: number;
  elevation: Range;
  traversable: boolean;
  mountable: boolean;
  flyable: boolean;
  swimmable: boolean;
  effects: TerrainEffect[];
}

export interface Biome {
  id: UUID;
  name: LocalizedString;
  type: BiomeType;
  flora: Flora[];
  fauna: Fauna[];
  climate: Climate;
  resources: BiomeResource[];
  hazards: BiomeHazard[];
  uniqueFeatures: BiomeFeature[];
}

export enum BiomeType {
  Forest = 'forest',
  Desert = 'desert',
  Tundra = 'tundra',
  Grassland = 'grassland',
  Wetland = 'wetland',
  Mountain = 'mountain',
  Ocean = 'ocean',
  Cave = 'cave',
  Volcanic = 'volcanic',
  Magical = 'magical',
  Corrupted = 'corrupted',
  Void = 'void'
}

// Many more detailed types would continue from here...
// This represents just a portion of the world system types

export interface LevelRange {
  min: number;
  max: number;
  recommended?: number;
  scaling?: boolean;
}

export interface SpawnCondition {
  type: 'time' | 'weather' | 'event' | 'quest' | 'phase' | 'player_count';
  value: any;
  operator: 'equals' | 'greater' | 'less' | 'between' | 'in' | 'not_in';
}

export interface Boundary {
  points: Vector3[];
  height: Range;
  type: 'wall' | 'fence' | 'natural' | 'magical' | 'invisible';
}

// Continue with more world-related types...