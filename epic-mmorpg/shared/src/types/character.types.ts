import { BaseEntity, UUID, DateString, Timestamp, Vector3, Resource, Stat, StatModifier, LocalizedString } from './common.types';
import { Inventory } from './items.types';
import { SkillSet } from './skills.types';
import { QuestLog } from './quests.types';
import { CombatStats } from './combat.types';

export interface Character extends BaseEntity {
  playerId: UUID;
  name: string;
  title?: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  race: Race;
  class: CharacterClass;
  subClass?: SubClass;
  gender: Gender;
  appearance: CharacterAppearance;
  stats: CharacterStats;
  attributes: CharacterAttributes;
  resources: CharacterResources;
  location: CharacterLocation;
  equipment: CharacterEquipment;
  inventory: Inventory;
  skills: SkillSet;
  talents: TalentTree;
  specialization: Specialization;
  buffs: Buff[];
  debuffs: Debuff[];
  auras: Aura[];
  combatStats: CombatStats;
  questLog: QuestLog;
  reputation: CharacterReputation[];
  currencies: CharacterCurrency[];
  professions: Profession[];
  achievements: UUID[];
  titles: UUID[];
  mounts: Mount[];
  pets: Pet[];
  companions: Companion[];
  collections: CharacterCollections;
  pvpStats: PvPStats;
  pveStats: PvEStats;
  guildId?: UUID;
  guildRank?: number;
  partyId?: UUID;
  raidId?: UUID;
  arenaTeams: ArenaTeam[];
  friends: UUID[];
  ignored: UUID[];
  mailbox: Mail[];
  auctionListings: UUID[];
  bankSlots: BankSlot[];
  keyring: Key[];
  soulboundItems: UUID[];
  playTime: number; // seconds
  lastPlayed: DateString;
  deathCount: number;
  honorableKills: number;
  dishonorableKills: number;
  currentActivity?: Activity;
  restBonus: number;
  innLocation?: InnLocation;
  bindLocation: BindLocation;
  exploredZones: string[];
  flightPaths: string[];
  unlockedContent: UnlockedContent;
  customization: CharacterCustomization;
  voicePackId?: string;
  emotePackId?: string;
  combatLogId?: UUID;
  isOnline: boolean;
  isResting: boolean;
  isDead: boolean;
  isGhost: boolean;
  isStealthed: boolean;
  isInCombat: boolean;
  isPvPFlagged: boolean;
  isAFK: boolean;
  isDND: boolean;
}

export interface Race {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  faction: Faction;
  startingZone: string;
  startingClass: string[];
  racialAbilities: RacialAbility[];
  baseStats: BaseStats;
  resistances: Resistances;
  size: CharacterSize;
  modelId: string;
  animations: AnimationSet;
  customizationOptions: CustomizationOptions;
}

export interface CharacterClass {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  role: ClassRole;
  armorType: ArmorType;
  weaponTypes: WeaponType[];
  primaryResource: ResourceType;
  secondaryResource?: ResourceType;
  baseStats: BaseStats;
  abilities: ClassAbility[];
  talentTrees: string[];
  specializations: string[];
  classHallId?: string;
  classMount?: string;
  classColor: string;
  iconId: string;
}

export interface SubClass {
  id: string;
  name: LocalizedString;
  parentClass: string;
  requirements: SubClassRequirement[];
  bonuses: SubClassBonus[];
  uniqueAbilities: string[];
  questLine?: string;
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other'
}

export enum Faction {
  Alliance = 'alliance',
  Horde = 'horde',
  Neutral = 'neutral'
}

export enum ClassRole {
  Tank = 'tank',
  Healer = 'healer',
  DPS = 'dps',
  Support = 'support',
  Hybrid = 'hybrid'
}

export enum ArmorType {
  Cloth = 'cloth',
  Leather = 'leather',
  Mail = 'mail',
  Plate = 'plate'
}

export enum WeaponType {
  Sword = 'sword',
  Axe = 'axe',
  Mace = 'mace',
  Dagger = 'dagger',
  Staff = 'staff',
  Wand = 'wand',
  Bow = 'bow',
  Crossbow = 'crossbow',
  Gun = 'gun',
  Polearm = 'polearm',
  Shield = 'shield',
  Offhand = 'offhand',
  TwoHandedSword = 'two_handed_sword',
  TwoHandedAxe = 'two_handed_axe',
  TwoHandedMace = 'two_handed_mace',
  Fist = 'fist',
  Thrown = 'thrown'
}

export enum ResourceType {
  Health = 'health',
  Mana = 'mana',
  Energy = 'energy',
  Rage = 'rage',
  Focus = 'focus',
  RunicPower = 'runic_power',
  Chi = 'chi',
  HolyPower = 'holy_power',
  SoulShards = 'soul_shards',
  ArcaneCharges = 'arcane_charges',
  ComboPoints = 'combo_points',
  Maelstrom = 'maelstrom',
  Fury = 'fury',
  Pain = 'pain',
  Insanity = 'insanity'
}

export enum CharacterSize {
  Tiny = 'tiny',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Huge = 'huge'
}

export interface CharacterAppearance {
  height: number;
  bodyType: number;
  skinColor: string;
  skinTexture: number;
  faceType: number;
  faceFeatures: FaceFeatures;
  hairStyle: number;
  hairColor: string;
  hairTexture: number;
  eyeColor: string;
  eyeShape: number;
  accessories: Accessory[];
  tattoos: Tattoo[];
  scars: Scar[];
  piercings: Piercing[];
  makeup: Makeup;
  voice: number;
  animations: CharacterAnimations;
}

export interface FaceFeatures {
  eyebrowType: number;
  eyebrowColor: string;
  noseType: number;
  mouthType: number;
  chinType: number;
  cheekType: number;
  earType: number;
  jawType: number;
  facialHair?: number;
  facialHairColor?: string;
}

export interface Accessory {
  type: string;
  modelId: string;
  color?: string;
  position?: Vector3;
  scale?: number;
}

export interface Tattoo {
  id: string;
  location: string;
  size: number;
  rotation: number;
  color: string;
  opacity: number;
}

export interface Scar {
  id: string;
  location: string;
  size: number;
  depth: number;
  age: 'fresh' | 'healed' | 'old';
}

export interface Piercing {
  type: string;
  location: string;
  jewelry: string;
  material: string;
}

export interface Makeup {
  foundation?: string;
  blush?: string;
  lipstick?: string;
  eyeshadow?: string;
  eyeliner?: string;
  other?: string[];
}

export interface CharacterAnimations {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  attack: string[];
  cast: string[];
  dance: string[];
  emotes: { [key: string]: string };
  combat: CombatAnimations;
  mount: MountAnimations;
  special: SpecialAnimations;
}

export interface CombatAnimations {
  meleeAttack: string[];
  rangedAttack: string[];
  spellCast: string[];
  block: string;
  parry: string;
  dodge: string;
  hit: string;
  criticalHit: string;
  death: string;
}

export interface MountAnimations {
  mount: string;
  dismount: string;
  mountedIdle: string;
  mountedWalk: string;
  mountedRun: string;
  mountedJump: string;
}

export interface SpecialAnimations {
  levelUp: string;
  victory: string;
  defeat: string;
  sleep: string;
  eat: string;
  drink: string;
  craft: string;
  gather: string;
  fish: string;
  transform: string[];
}

export interface CharacterStats {
  strength: Stat;
  agility: Stat;
  stamina: Stat;
  intellect: Stat;
  spirit: Stat;
  armor: Stat;
  attackPower: Stat;
  spellPower: Stat;
  criticalChance: Stat;
  criticalDamage: Stat;
  haste: Stat;
  mastery: Stat;
  versatility: Stat;
  leech: Stat;
  avoidance: Stat;
  speed: Stat;
  dodge: Stat;
  parry: Stat;
  block: Stat;
  resilience: Stat;
  expertise: Stat;
  hitRating: Stat;
  penetration: Stat;
  multistrike: Stat;
}

export interface CharacterAttributes {
  luck: number;
  karma: number;
  reputation: number;
  charisma: number;
  wisdom: number;
  perception: number;
  willpower: number;
  endurance: number;
  dexterity: number;
  constitution: number;
}

export interface CharacterResources {
  health: Resource;
  mana?: Resource;
  energy?: Resource;
  rage?: Resource;
  focus?: Resource;
  runicPower?: Resource;
  chi?: Resource;
  holyPower?: Resource;
  soulShards?: Resource;
  arcaneCharges?: Resource;
  comboPoints?: Resource;
  customResource?: CustomResource;
}

export interface CustomResource extends Resource {
  name: string;
  color: string;
  icon: string;
  decayRate?: number;
  gainRate?: number;
}

export interface CharacterLocation {
  worldId: string;
  zoneId: string;
  subZoneId?: string;
  position: Vector3;
  rotation: number;
  instanceId?: string;
  phaseId?: string;
  realmId: string;
}

export interface CharacterEquipment {
  head?: EquipmentSlot;
  neck?: EquipmentSlot;
  shoulders?: EquipmentSlot;
  back?: EquipmentSlot;
  chest?: EquipmentSlot;
  shirt?: EquipmentSlot;
  tabard?: EquipmentSlot;
  wrists?: EquipmentSlot;
  hands?: EquipmentSlot;
  waist?: EquipmentSlot;
  legs?: EquipmentSlot;
  feet?: EquipmentSlot;
  finger1?: EquipmentSlot;
  finger2?: EquipmentSlot;
  trinket1?: EquipmentSlot;
  trinket2?: EquipmentSlot;
  mainHand?: EquipmentSlot;
  offHand?: EquipmentSlot;
  ranged?: EquipmentSlot;
  ammo?: EquipmentSlot;
}

export interface EquipmentSlot {
  itemId: UUID;
  enchantments: Enchantment[];
  gems: Gem[];
  upgrades: ItemUpgrade[];
  transmogId?: string;
  durability: number;
  maxDurability: number;
}

export interface Enchantment {
  id: string;
  name: LocalizedString;
  effect: string;
  power: number;
  duration?: number;
  source: string;
}

export interface Gem {
  id: string;
  socketType: SocketType;
  stats: StatModifier[];
  setBonus?: SetBonus;
}

export enum SocketType {
  Red = 'red',
  Blue = 'blue',
  Yellow = 'yellow',
  Meta = 'meta',
  Prismatic = 'prismatic',
  Cogwheel = 'cogwheel',
  Hydraulic = 'hydraulic',
  Relic = 'relic'
}

export interface ItemUpgrade {
  id: string;
  level: number;
  stats: StatModifier[];
  cost: UpgradeCost;
}

export interface UpgradeCost {
  currency: string;
  amount: number;
  materials?: { itemId: string; quantity: number }[];
}

export interface SetBonus {
  setId: string;
  piecesEquipped: number;
  bonuses: { pieces: number; effect: string }[];
}

export interface TalentTree {
  treeId: string;
  points: TalentPoint[];
  totalPoints: number;
  maxPoints: number;
  builds: TalentBuild[];
  activeBuild?: string;
}

export interface TalentPoint {
  talentId: string;
  rank: number;
  maxRank: number;
}

export interface TalentBuild {
  id: string;
  name: string;
  talents: TalentPoint[];
  description?: string;
  isPublic: boolean;
  rating?: number;
}

export interface Specialization {
  id: string;
  name: LocalizedString;
  role: ClassRole;
  abilities: string[];
  passives: string[];
  masteryId: string;
  artifactId?: string;
  soulbindId?: string;
}

export interface Buff {
  id: UUID;
  buffId: string;
  name: LocalizedString;
  icon: string;
  description: string;
  source: string;
  caster?: UUID;
  stacks: number;
  maxStacks: number;
  duration: number;
  remaining: number;
  appliedAt: Timestamp;
  expiresAt: Timestamp;
  effects: BuffEffect[];
  dispellable: boolean;
  dispelType?: DispelType;
}

export interface Debuff extends Buff {
  harmfulLevel: 'minor' | 'moderate' | 'major' | 'deadly';
  spreadable: boolean;
  curse?: boolean;
  disease?: boolean;
  poison?: boolean;
  magic?: boolean;
}

export interface Aura {
  id: UUID;
  auraId: string;
  name: LocalizedString;
  type: AuraType;
  radius: number;
  effects: AuraEffect[];
  affectsAllies: boolean;
  affectsEnemies: boolean;
  persistent: boolean;
  source: string;
}

export enum AuraType {
  Beneficial = 'beneficial',
  Harmful = 'harmful',
  Mixed = 'mixed',
  Environmental = 'environmental'
}

export interface BuffEffect {
  stat?: string;
  value: number;
  type: 'flat' | 'percent' | 'multiplier';
  special?: string;
}

export interface AuraEffect extends BuffEffect {
  tickRate?: number;
  procChance?: number;
  procCondition?: string;
}

export enum DispelType {
  Magic = 'magic',
  Curse = 'curse',
  Disease = 'disease',
  Poison = 'poison',
  Physical = 'physical'
}

export interface BaseStats {
  strength: number;
  agility: number;
  stamina: number;
  intellect: number;
  spirit: number;
}

export interface Resistances {
  physical: number;
  fire: number;
  frost: number;
  nature: number;
  shadow: number;
  arcane: number;
  holy: number;
}

export interface RacialAbility {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  cooldown?: number;
  passive: boolean;
  effects: string[];
}

export interface ClassAbility {
  id: string;
  name: LocalizedString;
  rank: number;
  maxRank: number;
  requiredLevel: number;
  description: LocalizedString;
  icon: string;
  school: SpellSchool;
  cost?: ResourceCost;
  range: number;
  castTime: number;
  cooldown: number;
  globalCooldown: boolean;
  effects: AbilityEffect[];
  talents?: string[];
  glyphs?: string[];
}

export enum SpellSchool {
  Physical = 'physical',
  Fire = 'fire',
  Frost = 'frost',
  Nature = 'nature',
  Shadow = 'shadow',
  Arcane = 'arcane',
  Holy = 'holy'
}

export interface ResourceCost {
  type: ResourceType;
  amount: number;
  percentage?: boolean;
}

export interface AbilityEffect {
  type: EffectType;
  target: TargetType;
  value: number;
  duration?: number;
  chance?: number;
  conditions?: string[];
}

export enum EffectType {
  Damage = 'damage',
  Heal = 'heal',
  Shield = 'shield',
  Buff = 'buff',
  Debuff = 'debuff',
  Summon = 'summon',
  Teleport = 'teleport',
  Transform = 'transform',
  Control = 'control',
  Dispel = 'dispel',
  Interrupt = 'interrupt'
}

export enum TargetType {
  Self = 'self',
  Target = 'target',
  Area = 'area',
  Cone = 'cone',
  Chain = 'chain',
  Random = 'random',
  Party = 'party',
  Raid = 'raid'
}

export interface AnimationSet {
  idle: string[];
  walk: string;
  run: string;
  sprint: string;
  jump: string;
  fall: string;
  land: string;
  swim: string;
  attack: string[];
  spellcast: string[];
  death: string;
  resurrect: string;
  mount: string;
  dismount: string;
  interact: string;
  emotes: { [key: string]: string };
}

export interface CustomizationOptions {
  skinColors: string[];
  hairStyles: number[];
  hairColors: string[];
  faceTypes: number[];
  features: CustomizationFeature[];
}

export interface CustomizationFeature {
  id: string;
  name: LocalizedString;
  type: 'slider' | 'choice' | 'color';
  options: any[];
  restrictions?: string[];
}

export interface SubClassRequirement {
  type: 'level' | 'quest' | 'achievement' | 'item' | 'reputation';
  value: any;
  description: LocalizedString;
}

export interface SubClassBonus {
  type: 'stat' | 'ability' | 'passive' | 'unlock';
  value: any;
  description: LocalizedString;
}

export interface CharacterReputation {
  factionId: string;
  name: LocalizedString;
  standing: ReputationStanding;
  value: number;
  max: number;
  rank: number;
  rewards: ReputationReward[];
}

export enum ReputationStanding {
  Hated = 'hated',
  Hostile = 'hostile',
  Unfriendly = 'unfriendly',
  Neutral = 'neutral',
  Friendly = 'friendly',
  Honored = 'honored',
  Revered = 'revered',
  Exalted = 'exalted'
}

export interface ReputationReward {
  rank: number;
  type: 'item' | 'recipe' | 'mount' | 'title' | 'discount';
  value: any;
  claimed: boolean;
}

export interface CharacterCurrency {
  currencyId: string;
  amount: number;
  weeklyEarned?: number;
  weeklyMax?: number;
  totalMax?: number;
  season?: string;
}

export interface Profession {
  id: string;
  name: LocalizedString;
  rank: number;
  maxRank: number;
  skillPoints: number;
  maxSkillPoints: number;
  recipes: Recipe[];
  specialization?: ProfessionSpecialization;
  tools?: string[];
  dailyCooldowns: Cooldown[];
}

export interface Recipe {
  id: string;
  name: LocalizedString;
  learned: boolean;
  skillRequired: number;
  materials: RecipeMaterial[];
  results: RecipeResult[];
  cooldown?: number;
  discoveredBy?: string;
}

export interface RecipeMaterial {
  itemId: string;
  quantity: number;
  quality?: number;
}

export interface RecipeResult {
  itemId: string;
  quantity: number;
  chance: number;
  qualityRange?: { min: number; max: number };
}

export interface ProfessionSpecialization {
  id: string;
  name: LocalizedString;
  bonuses: string[];
  recipes: string[];
}

export interface Cooldown {
  id: string;
  name: LocalizedString;
  duration: number;
  remaining: number;
  charges?: number;
  maxCharges?: number;
}

export interface Mount {
  id: string;
  name: LocalizedString;
  modelId: string;
  speed: number;
  canFly: boolean;
  canSwim: boolean;
  specialAbility?: string;
  obtained: boolean;
  favorite: boolean;
  customization?: MountCustomization;
}

export interface MountCustomization {
  armor?: string;
  saddle?: string;
  reins?: string;
  color?: string;
  accessories?: string[];
}

export interface Pet {
  id: UUID;
  speciesId: string;
  name: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  happiness?: number;
  loyalty?: number;
  abilities: string[];
  stats: PetStats;
  customization?: PetCustomization;
  battlePet?: BattlePetInfo;
}

export interface PetStats {
  power: number;
  speed: number;
  stamina: number;
}

export interface PetCustomization {
  collar?: string;
  accessory?: string;
  color?: string;
  pattern?: string;
}

export interface BattlePetInfo {
  wins: number;
  losses: number;
  battleAbilities: string[];
  rarity: string;
  breedId: string;
}

export interface Companion {
  id: UUID;
  npcId: string;
  name: string;
  relationship: number;
  trust: number;
  abilities: string[];
  equipment?: CompanionEquipment;
  dialogue: CompanionDialogue[];
  questline?: string;
}

export interface CompanionEquipment {
  weapon?: string;
  armor?: string;
  accessory?: string;
}

export interface CompanionDialogue {
  id: string;
  unlocked: boolean;
  heardCount: number;
  conditions?: string[];
}

export interface CharacterCollections {
  toys: string[];
  heirlooms: string[];
  transmogs: TransmogCollection;
  music: string[];
  books: string[];
  artifacts: string[];
  memories: string[];
}

export interface TransmogCollection {
  weapons: string[];
  armor: string[];
  cosmetics: string[];
  enchantments: string[];
  sets: string[];
}

export interface PvPStats {
  rating: number;
  highestRating: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  honorLevel: number;
  honorPoints: number;
  conquestPoints: number;
  currentStreak: number;
  longestStreak: number;
  nemeses: Nemesis[];
  achievements: string[];
}

export interface Nemesis {
  characterId: UUID;
  kills: number;
  deaths: number;
  lastEncounter: DateString;
}

export interface PvEStats {
  dungeonsCompleted: number;
  raidsCompleted: number;
  mythicPlusRating: number;
  highestMythicPlus: number;
  challengeModeRecords: ChallengeRecord[];
  raidProgression: RaidProgression[];
  worldBossKills: string[];
}

export interface ChallengeRecord {
  dungeonId: string;
  level: number;
  time: number;
  affixes: string[];
  date: DateString;
  party: UUID[];
}

export interface RaidProgression {
  raidId: string;
  difficulty: RaidDifficulty;
  bosses: BossProgress[];
  achievements: string[];
}

export enum RaidDifficulty {
  LFR = 'lfr',
  Normal = 'normal',
  Heroic = 'heroic',
  Mythic = 'mythic'
}

export interface BossProgress {
  bossId: string;
  defeated: boolean;
  attempts: number;
  firstKill?: DateString;
  fastestKill?: number;
}

export interface ArenaTeam {
  id: UUID;
  name: string;
  bracket: '2v2' | '3v3' | '5v5';
  rating: number;
  wins: number;
  losses: number;
  members: ArenaTeamMember[];
  rank?: number;
  season: string;
}

export interface ArenaTeamMember {
  characterId: UUID;
  role: 'leader' | 'member';
  gamesPlayed: number;
  personalRating: number;
}

export interface Mail {
  id: UUID;
  sender: string;
  subject: string;
  body: string;
  attachments: MailAttachment[];
  gold?: number;
  sentAt: DateString;
  expiresAt: DateString;
  read: boolean;
  returned: boolean;
  cod?: number; // cash on delivery
}

export interface MailAttachment {
  itemId: UUID;
  quantity: number;
}

export interface BankSlot {
  tabId: number;
  name: string;
  icon: string;
  slots: number;
  items: UUID[];
  permissions: BankPermissions;
}

export interface BankPermissions {
  view: 'all' | 'guild' | 'rank' | 'self';
  deposit: 'all' | 'guild' | 'rank' | 'self';
  withdraw: 'all' | 'guild' | 'rank' | 'self';
  withdrawLimit?: number;
}

export interface Key {
  id: UUID;
  keyId: string;
  name: LocalizedString;
  charges?: number;
  instanceId?: string;
  difficulty?: string;
  expiresAt?: DateString;
}

export interface Activity {
  type: ActivityType;
  target?: string;
  startedAt: Timestamp;
  progress?: number;
  party?: UUID[];
}

export enum ActivityType {
  Questing = 'questing',
  Dungeon = 'dungeon',
  Raid = 'raid',
  PvP = 'pvp',
  Crafting = 'crafting',
  Gathering = 'gathering',
  Fishing = 'fishing',
  Exploring = 'exploring',
  Trading = 'trading',
  Socializing = 'socializing',
  AFK = 'afk'
}

export interface InnLocation {
  innId: string;
  zoneId: string;
  position: Vector3;
  name: LocalizedString;
  restBonus: number;
}

export interface BindLocation {
  type: 'graveyard' | 'inn' | 'custom';
  zoneId: string;
  position: Vector3;
  name?: LocalizedString;
}

export interface UnlockedContent {
  zones: string[];
  dungeons: string[];
  raids: string[];
  scenarios: string[];
  pvpModes: string[];
  features: string[];
  collections: string[];
  achievements: string[];
  titles: string[];
  mounts: string[];
  pets: string[];
  toys: string[];
}

export interface CharacterCustomization {
  outfits: Outfit[];
  actionBars: ActionBar[];
  keybindings: { [action: string]: string };
  macros: CharacterMacro[];
  addons: string[];
  savedVariables: { [addon: string]: any };
}

export interface Outfit {
  id: UUID;
  name: string;
  icon: string;
  items: { [slot: string]: string };
  enchants: { [slot: string]: string };
  favorite: boolean;
}

export interface ActionBar {
  barId: number;
  slots: ActionBarSlot[];
  visible: boolean;
  locked: boolean;
  scale: number;
  opacity: number;
}

export interface ActionBarSlot {
  slotId: number;
  type: 'ability' | 'item' | 'macro' | 'mount' | 'pet';
  actionId: string;
  keybind?: string;
}

export interface CharacterMacro {
  id: UUID;
  name: string;
  icon: string;
  body: string;
  global: boolean;
}