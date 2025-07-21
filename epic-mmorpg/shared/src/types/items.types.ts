import { BaseEntity, UUID, LocalizedString, Rarity, StatModifier, Requirement, Range, Color, WeightedItem } from './common.types';

// Base Item Types
export interface Item extends BaseEntity {
  itemId: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  model?: string;
  type: ItemType;
  subType: string;
  quality: ItemQuality;
  rarity: Rarity;
  level: number;
  requiredLevel: number;
  requirements: Requirement[];
  bindType: BindType;
  stackable: boolean;
  maxStack: number;
  unique: boolean;
  uniqueEquipped: boolean;
  soulbound: boolean;
  accountBound: boolean;
  value: ItemValue;
  weight: number;
  durability?: Durability;
  charges?: number;
  cooldown?: number;
  useEffect?: UseEffect;
  onEquipEffect?: EquipEffect;
  stats?: ItemStats;
  bonuses?: ItemBonus[];
  sockets?: Socket[];
  enchantable: boolean;
  enchantment?: Enchantment;
  upgradeable: boolean;
  upgrade?: ItemUpgrade;
  setId?: string;
  questItem: boolean;
  startQuest?: string;
  consumable: boolean;
  consumed?: boolean;
  expiresAt?: Date;
  source?: ItemSource;
  flavorText?: LocalizedString;
  lore?: LocalizedString;
  restrictions?: ItemRestriction[];
  transmogId?: string;
  appearance?: ItemAppearance;
  sound?: ItemSound;
  particles?: ParticleEffect;
}

export enum ItemType {
  Weapon = 'weapon',
  Armor = 'armor',
  Accessory = 'accessory',
  Consumable = 'consumable',
  Material = 'material',
  Quest = 'quest',
  Misc = 'misc',
  Container = 'container',
  Currency = 'currency',
  Tool = 'tool',
  Toy = 'toy',
  Mount = 'mount',
  Pet = 'pet',
  Recipe = 'recipe',
  Book = 'book',
  Key = 'key',
  Gem = 'gem',
  Enchantment = 'enchantment',
  Rune = 'rune',
  Token = 'token'
}

export enum ItemQuality {
  Poor = 'poor',
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
  Artifact = 'artifact',
  Heirloom = 'heirloom'
}

export enum BindType {
  None = 'none',
  OnPickup = 'pickup',
  OnEquip = 'equip',
  OnUse = 'use',
  OnTrade = 'trade'
}

export interface ItemValue {
  sell: number;
  buy?: number;
  repair?: number;
  disenchant?: DisenchantValue;
}

export interface DisenchantValue {
  materials: MaterialYield[];
  skillRequired: number;
  chance: number;
}

export interface MaterialYield {
  itemId: string;
  min: number;
  max: number;
  chance: number;
}

export interface Durability {
  current: number;
  max: number;
  loss: number; // per death/use
  broken: boolean;
  repairCost: number;
  indestructible: boolean;
}

export interface UseEffect {
  type: UseEffectType;
  target: TargetType;
  value: any;
  duration?: number;
  cooldown?: number;
  charges?: number;
  consumeOnUse: boolean;
  requiresCombat?: boolean;
  castTime?: number;
  animation?: string;
  sound?: string;
  particles?: string;
}

export enum UseEffectType {
  Heal = 'heal',
  Damage = 'damage',
  Buff = 'buff',
  Debuff = 'debuff',
  Teleport = 'teleport',
  Summon = 'summon',
  Transform = 'transform',
  LearnSpell = 'learn_spell',
  LearnRecipe = 'learn_recipe',
  Currency = 'currency',
  Experience = 'experience',
  Reputation = 'reputation',
  QuestProgress = 'quest_progress',
  OpenContainer = 'open_container',
  RandomItem = 'random_item',
  Resurrect = 'resurrect',
  Food = 'food',
  Drink = 'drink',
  Potion = 'potion',
  Elixir = 'elixir',
  Flask = 'flask',
  Bandage = 'bandage',
  Explosive = 'explosive',
  Toy = 'toy',
  Mount = 'mount',
  Pet = 'pet',
  Companion = 'companion',
  Portal = 'portal',
  Hearthstone = 'hearthstone'
}

export enum TargetType {
  Self = 'self',
  Target = 'target',
  Group = 'group',
  Raid = 'raid',
  Area = 'area',
  Cone = 'cone',
  Chain = 'chain'
}

export interface EquipEffect {
  stats?: StatModifier[];
  auras?: string[];
  procs?: ProcEffect[];
  setBonus?: SetBonus;
  visualEffect?: string;
  sound?: string;
}

export interface ProcEffect {
  id: string;
  trigger: ProcTrigger;
  chance: number;
  effect: string;
  cooldown?: number;
  ppm?: number; // procs per minute
  stacks?: number;
}

export enum ProcTrigger {
  OnHit = 'on_hit',
  OnCrit = 'on_crit',
  OnKill = 'on_kill',
  OnDamage = 'on_damage',
  OnHeal = 'on_heal',
  OnCast = 'on_cast',
  OnBlock = 'on_block',
  OnDodge = 'on_dodge',
  OnParry = 'on_parry'
}

export interface ItemStats {
  primary: PrimaryStat[];
  secondary: SecondaryStat[];
  resistance?: Resistance[];
  other?: OtherStat[];
}

export interface PrimaryStat {
  stat: 'strength' | 'agility' | 'stamina' | 'intellect' | 'spirit';
  value: number;
}

export interface SecondaryStat {
  stat: 'criticalStrike' | 'haste' | 'mastery' | 'versatility' | 'leech' | 'avoidance' | 'speed';
  value: number;
  rating?: number;
}

export interface Resistance {
  type: 'physical' | 'fire' | 'frost' | 'nature' | 'shadow' | 'arcane' | 'holy';
  value: number;
}

export interface OtherStat {
  stat: string;
  value: number;
  display?: string;
}

export interface ItemBonus {
  id: string;
  type: BonusType;
  value: any;
  condition?: BonusCondition;
}

export enum BonusType {
  Stat = 'stat',
  Damage = 'damage',
  Healing = 'healing',
  Skill = 'skill',
  Reputation = 'reputation',
  Experience = 'experience',
  Gold = 'gold',
  MovementSpeed = 'movement_speed',
  AttackSpeed = 'attack_speed',
  CastSpeed = 'cast_speed',
  CooldownReduction = 'cooldown_reduction',
  ResourceCost = 'resource_cost',
  Range = 'range',
  AreaOfEffect = 'area_of_effect'
}

export interface BonusCondition {
  type: 'health' | 'time' | 'zone' | 'target' | 'combat' | 'stealth' | 'mounted';
  value: any;
  operator: 'less' | 'greater' | 'equal' | 'between';
}

export interface Socket {
  id: UUID;
  type: SocketType;
  gem?: Gem;
  locked: boolean;
  bonus?: SocketBonus;
}

export enum SocketType {
  Red = 'red',
  Blue = 'blue',
  Yellow = 'yellow',
  Meta = 'meta',
  Prismatic = 'prismatic',
  Cogwheel = 'cogwheel',
  Sha = 'sha',
  Domination = 'domination',
  Relic = 'relic'
}

export interface Gem {
  id: UUID;
  itemId: string;
  name: LocalizedString;
  quality: ItemQuality;
  socketType: SocketType;
  stats: StatModifier[];
  uniqueEquipped: boolean;
  requiredLevel: number;
  requiredItemLevel?: number;
  setBonus?: GemSetBonus;
}

export interface SocketBonus {
  active: boolean;
  stats: StatModifier[];
}

export interface GemSetBonus {
  setId: string;
  required: number;
  bonus: StatModifier[];
}

export interface Enchantment {
  id: string;
  name: LocalizedString;
  rank?: number;
  stats: StatModifier[];
  procs?: ProcEffect[];
  visualEffect?: string;
  itemTypes: ItemType[];
  subTypes?: string[];
  requiredLevel?: number;
  requiredSkill?: SkillRequirement;
  materials?: EnchantMaterial[];
  duration?: number; // temporary enchants
  charges?: number;
}

export interface SkillRequirement {
  skill: string;
  level: number;
}

export interface EnchantMaterial {
  itemId: string;
  quantity: number;
}

export interface ItemUpgrade {
  level: number;
  maxLevel: number;
  stats: StatModifier[];
  cost: UpgradeCost;
  nextUpgrade?: ItemUpgrade;
}

export interface UpgradeCost {
  currency?: CurrencyCost[];
  items?: ItemCost[];
  success: number; // success rate
  failureDowngrade?: number; // levels lost on failure
  protection?: string; // protection item ID
}

export interface CurrencyCost {
  type: string;
  amount: number;
}

export interface ItemCost {
  itemId: string;
  quantity: number;
}

export interface ItemSource {
  type: SourceType;
  id: string;
  name?: LocalizedString;
  dropChance?: number;
  conditions?: SourceCondition[];
}

export enum SourceType {
  Drop = 'drop',
  Quest = 'quest',
  Vendor = 'vendor',
  Craft = 'craft',
  Achievement = 'achievement',
  Event = 'event',
  Dungeon = 'dungeon',
  Raid = 'raid',
  PvP = 'pvp',
  WorldBoss = 'world_boss',
  RareSpawn = 'rare_spawn',
  Treasure = 'treasure',
  Gathering = 'gathering',
  Fishing = 'fishing',
  Archaeology = 'archaeology',
  Mission = 'mission',
  Garrison = 'garrison',
  ClassHall = 'class_hall',
  Covenant = 'covenant',
  Renown = 'renown',
  GreatVault = 'great_vault',
  MythicPlus = 'mythic_plus'
}

export interface SourceCondition {
  type: string;
  value: any;
}

export interface ItemRestriction {
  type: RestrictionType;
  value: any;
}

export enum RestrictionType {
  Class = 'class',
  Race = 'race',
  Faction = 'faction',
  Profession = 'profession',
  Reputation = 'reputation',
  Achievement = 'achievement',
  Quest = 'quest',
  Season = 'season',
  Event = 'event',
  Zone = 'zone',
  Instance = 'instance',
  PvPRank = 'pvp_rank',
  PvPRating = 'pvp_rating',
  Guild = 'guild',
  Covenant = 'covenant',
  Renown = 'renown'
}

export interface ItemAppearance {
  modelId: string;
  textureId?: string;
  colorVariation?: number;
  glowEffect?: GlowEffect;
  particleEffect?: string;
  trailEffect?: string;
  sheatheAnimation?: string;
  drawAnimation?: string;
  holdAnimation?: string;
}

export interface GlowEffect {
  color: Color;
  intensity: number;
  pulse?: boolean;
  speed?: number;
}

export interface ItemSound {
  equip?: string;
  unequip?: string;
  use?: string;
  hit?: string;
  proc?: string;
  break?: string;
  repair?: string;
}

export interface ParticleEffect {
  id: string;
  attachment: 'hand' | 'weapon' | 'chest' | 'head' | 'feet' | 'back';
  scale?: number;
  color?: Color;
}

// Specific Item Types

export interface Weapon extends Item {
  type: ItemType.Weapon;
  subType: WeaponType;
  damage: WeaponDamage;
  speed: number;
  dps: number;
  range?: number;
  twoHanded: boolean;
  weaponStats?: WeaponStats;
  specialAbility?: SpecialAbility;
}

export enum WeaponType {
  // One-Handed
  Sword1H = 'sword_1h',
  Axe1H = 'axe_1h',
  Mace1H = 'mace_1h',
  Dagger = 'dagger',
  Fist = 'fist',
  // Two-Handed
  Sword2H = 'sword_2h',
  Axe2H = 'axe_2h',
  Mace2H = 'mace_2h',
  Staff = 'staff',
  Polearm = 'polearm',
  // Ranged
  Bow = 'bow',
  Crossbow = 'crossbow',
  Gun = 'gun',
  Thrown = 'thrown',
  Wand = 'wand',
  // Other
  Shield = 'shield',
  Offhand = 'offhand',
  FishingPole = 'fishing_pole'
}

export interface WeaponDamage {
  min: number;
  max: number;
  type: DamageType;
  bonus?: DamageBonus[];
}

export enum DamageType {
  Physical = 'physical',
  Fire = 'fire',
  Frost = 'frost',
  Nature = 'nature',
  Shadow = 'shadow',
  Arcane = 'arcane',
  Holy = 'holy',
  Chaos = 'chaos'
}

export interface DamageBonus {
  type: DamageType;
  min: number;
  max: number;
}

export interface WeaponStats {
  attackPower?: number;
  spellPower?: number;
  penetration?: number;
  expertise?: number;
  parry?: number;
  block?: number;
  blockValue?: number;
}

export interface SpecialAbility {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  trigger: 'use' | 'proc' | 'passive';
  effect: string;
  cooldown?: number;
  cost?: ResourceCost;
}

export interface ResourceCost {
  type: string;
  amount: number;
}

export interface Armor extends Item {
  type: ItemType.Armor;
  subType: ArmorType;
  slot: ArmorSlot;
  armorValue: number;
  armorClass: ArmorClass;
  resistance?: Resistance[];
  durability: Durability;
}

export enum ArmorType {
  Cloth = 'cloth',
  Leather = 'leather',
  Mail = 'mail',
  Plate = 'plate',
  Cosmetic = 'cosmetic'
}

export enum ArmorSlot {
  Head = 'head',
  Neck = 'neck',
  Shoulders = 'shoulders',
  Back = 'back',
  Chest = 'chest',
  Wrists = 'wrists',
  Hands = 'hands',
  Waist = 'waist',
  Legs = 'legs',
  Feet = 'feet',
  Finger = 'finger',
  Trinket = 'trinket',
  Shirt = 'shirt',
  Tabard = 'tabard'
}

export enum ArmorClass {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Magical = 'magical'
}

export interface Accessory extends Item {
  type: ItemType.Accessory;
  subType: AccessoryType;
  slot: AccessorySlot;
  effect?: AccessoryEffect;
}

export enum AccessoryType {
  Ring = 'ring',
  Necklace = 'necklace',
  Trinket = 'trinket',
  Relic = 'relic',
  Artifact = 'artifact'
}

export enum AccessorySlot {
  Finger1 = 'finger1',
  Finger2 = 'finger2',
  Neck = 'neck',
  Trinket1 = 'trinket1',
  Trinket2 = 'trinket2',
  Relic = 'relic'
}

export interface AccessoryEffect {
  type: 'active' | 'passive' | 'proc';
  ability?: SpecialAbility;
  aura?: string;
  stats?: StatModifier[];
}

export interface Consumable extends Item {
  type: ItemType.Consumable;
  subType: ConsumableType;
  effect: ConsumableEffect;
  duration?: number;
  cooldownGroup?: string;
  requiresSitting?: boolean;
  combatUsable: boolean;
  charges: number;
  sharedCooldown?: string;
}

export enum ConsumableType {
  Food = 'food',
  Drink = 'drink',
  Potion = 'potion',
  Elixir = 'elixir',
  Flask = 'flask',
  Scroll = 'scroll',
  Bandage = 'bandage',
  Rune = 'rune',
  Vantus = 'vantus',
  Augment = 'augment',
  Tome = 'tome',
  Contract = 'contract',
  Kit = 'kit',
  Explosive = 'explosive',
  Utility = 'utility'
}

export interface ConsumableEffect {
  type: string;
  value: any;
  overTime?: boolean;
  tickRate?: number;
  stacks?: boolean;
  maxStacks?: number;
  persist?: boolean;
}

export interface Container extends Item {
  type: ItemType.Container;
  subType: ContainerType;
  slots: number;
  items?: Item[];
  lootTable?: string;
  keyRequired?: string;
  destroyOnOpen?: boolean;
  broadcastOpen?: boolean;
}

export enum ContainerType {
  Bag = 'bag',
  Box = 'box',
  Chest = 'chest',
  Crate = 'crate',
  Barrel = 'barrel',
  Package = 'package',
  Present = 'present',
  Lockbox = 'lockbox',
  Herb = 'herb',
  Mining = 'mining',
  Skinning = 'skinning',
  Engineering = 'engineering',
  Inscription = 'inscription',
  Special = 'special'
}

export interface Recipe extends Item {
  type: ItemType.Recipe;
  subType: RecipeType;
  profession: string;
  skillRequired: number;
  skillUp: SkillUp;
  teaches: CraftingRecipe;
  source?: RecipeSource;
  rank?: number;
  maxRank?: number;
}

export enum RecipeType {
  Alchemy = 'alchemy',
  Blacksmithing = 'blacksmithing',
  Enchanting = 'enchanting',
  Engineering = 'engineering',
  Herbalism = 'herbalism',
  Inscription = 'inscription',
  Jewelcrafting = 'jewelcrafting',
  Leatherworking = 'leatherworking',
  Mining = 'mining',
  Skinning = 'skinning',
  Tailoring = 'tailoring',
  Archaeology = 'archaeology',
  Cooking = 'cooking',
  Fishing = 'fishing',
  FirstAid = 'first_aid'
}

export interface SkillUp {
  guaranteed: number;
  likely: number;
  unlikely: number;
  rare: number;
}

export interface CraftingRecipe {
  id: string;
  name: LocalizedString;
  materials: RecipeMaterial[];
  tools?: string[];
  results: RecipeResult[];
  cooldown?: number;
  charges?: number;
  discoverable?: boolean;
  requiredAchievement?: string;
  requiredQuest?: string;
  requiredReputation?: ReputationRequirement;
}

export interface RecipeMaterial {
  itemId: string;
  quantity: number;
  quality?: ItemQuality;
  optional?: boolean;
  alternatives?: string[];
}

export interface RecipeResult {
  itemId: string;
  quantity: Range;
  chance?: number;
  bonus?: BonusResult[];
}

export interface BonusResult {
  condition: string;
  itemId: string;
  quantity: number;
  chance: number;
}

export interface ReputationRequirement {
  faction: string;
  standing: string;
}

export interface RecipeSource {
  trainer?: boolean;
  discovery?: DiscoverySource;
  drop?: DropSource;
  vendor?: VendorSource;
  quest?: string;
  achievement?: string;
  reputation?: ReputationSource;
}

export interface DiscoverySource {
  chance: number;
  fromCrafting: string[];
}

export interface DropSource {
  npcs?: string[];
  zones?: string[];
  instances?: string[];
  chance: number;
}

export interface VendorSource {
  npcId: string;
  cost: ItemValue;
  currency?: string;
  stock?: number;
  respawnTime?: number;
}

export interface ReputationSource {
  faction: string;
  standing: string;
  cost: ItemValue;
}

// Sets
export interface ItemSet {
  id: string;
  name: LocalizedString;
  items: string[];
  bonuses: SetBonus[];
  class?: string[];
  spec?: string[];
  tier?: number;
  season?: string;
  legacy: boolean;
}

export interface SetBonus {
  pieces: number;
  stats?: StatModifier[];
  effects?: SetEffect[];
  abilities?: string[];
}

export interface SetEffect {
  type: string;
  value: any;
  proc?: ProcEffect;
}

// Inventory
export interface Inventory {
  bags: Bag[];
  equipped: EquippedItems;
  currency: Currency[];
  keyring: Key[];
  bank?: BankInventory;
  void?: VoidStorage;
  reagentBank?: ReagentBank;
  overflow?: Item[];
}

export interface Bag {
  id: UUID;
  slot: number;
  itemId?: string;
  slots: InventorySlot[];
  specialization?: BagSpecialization;
  locked: boolean;
}

export enum BagSpecialization {
  General = 'general',
  Herb = 'herb',
  Mining = 'mining',
  Gem = 'gem',
  Enchanting = 'enchanting',
  Engineering = 'engineering',
  Inscription = 'inscription',
  Leatherworking = 'leatherworking',
  Fishing = 'fishing',
  Cooking = 'cooking',
  Soul = 'soul',
  Quiver = 'quiver',
  AmmoPouch = 'ammo_pouch'
}

export interface InventorySlot {
  position: number;
  item?: Item;
  quantity?: number;
  locked: boolean;
}

export interface EquippedItems {
  head?: Item;
  neck?: Item;
  shoulders?: Item;
  back?: Item;
  chest?: Item;
  shirt?: Item;
  tabard?: Item;
  wrists?: Item;
  hands?: Item;
  waist?: Item;
  legs?: Item;
  feet?: Item;
  finger1?: Item;
  finger2?: Item;
  trinket1?: Item;
  trinket2?: Item;
  mainHand?: Item;
  offHand?: Item;
  ranged?: Item;
  ammo?: Item;
}

export interface Currency {
  id: string;
  name: LocalizedString;
  icon: string;
  amount: number;
  weeklyEarned?: number;
  weeklyMax?: number;
  totalMax?: number;
  season?: string;
  category: CurrencyCategory;
  tradeable: boolean;
}

export enum CurrencyCategory {
  General = 'general',
  PvP = 'pvp',
  PvE = 'pve',
  Crafting = 'crafting',
  Event = 'event',
  Legacy = 'legacy'
}

export interface Key {
  id: UUID;
  keyId: string;
  name: LocalizedString;
  opens: string[];
  charges?: number;
  permanent: boolean;
}

export interface BankInventory {
  tabs: BankTab[];
  gold: number;
}

export interface BankTab {
  id: UUID;
  slot: number;
  name?: string;
  icon?: string;
  access: BankAccess;
  items: InventorySlot[];
  purchased: boolean;
  cost?: ItemValue;
}

export enum BankAccess {
  Personal = 'personal',
  Guild = 'guild',
  Shared = 'shared'
}

export interface VoidStorage {
  items: VoidStorageItem[];
  maxSlots: number;
}

export interface VoidStorageItem {
  slot: number;
  item: Item;
  depositCost: number;
  withdrawCost: number;
}

export interface ReagentBank {
  slots: InventorySlot[];
  maxSlots: number;
  unlocked: boolean;
  cost?: ItemValue;
}

// Loot
export interface LootTable {
  id: string;
  name: string;
  items: LootItem[];
  gold?: LootGold;
  experience?: number;
  reputation?: LootReputation[];
  guaranteed?: string[];
  maxItems?: number;
  personal: boolean;
  shared: boolean;
  scaling?: LootScaling;
}

export interface LootItem {
  itemId: string;
  chance: number;
  quantity: Range;
  conditions?: LootCondition[];
  groupChance?: number;
  questOnly?: boolean;
  personalOnly?: boolean;
  bonusRoll?: boolean;
}

export interface LootGold {
  min: number;
  max: number;
  multiplier?: number;
}

export interface LootReputation {
  faction: string;
  amount: number;
  spillover?: ReputationSpillover[];
}

export interface ReputationSpillover {
  faction: string;
  percentage: number;
}

export interface LootCondition {
  type: 'class' | 'quest' | 'achievement' | 'level' | 'skill' | 'reputation';
  value: any;
  operator?: 'has' | 'not' | 'greater' | 'less';
}

export interface LootScaling {
  type: 'level' | 'players' | 'difficulty';
  factor: number;
  items?: boolean;
  gold?: boolean;
}

// Trading
export interface Trade {
  id: UUID;
  player1: TradeParticipant;
  player2: TradeParticipant;
  status: TradeStatus;
  timestamp: Date;
}

export interface TradeParticipant {
  playerId: UUID;
  items: TradeItem[];
  gold: number;
  confirmed: boolean;
  locked: boolean;
}

export interface TradeItem {
  slot: number;
  item: Item;
  quantity: number;
}

export enum TradeStatus {
  Pending = 'pending',
  Active = 'active',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

// Auction House
export interface AuctionListing {
  id: UUID;
  sellerId: UUID;
  item: Item;
  quantity: number;
  startPrice: number;
  buyoutPrice?: number;
  currentBid?: number;
  bidder?: UUID;
  duration: number;
  expiresAt: Date;
  sold: boolean;
  cancelled: boolean;
}

export interface AuctionBid {
  id: UUID;
  listingId: UUID;
  bidderId: UUID;
  amount: number;
  timestamp: Date;
  outbid: boolean;
  returned: boolean;
}

export interface AuctionHistory {
  itemId: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  volume: number;
  lastSeen: Date;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  date: Date;
  price: number;
  volume: number;
}

// Item Generation
export interface ItemGenerator {
  generateRandomItem(options: GeneratorOptions): Item;
  generateLoot(table: LootTable, player?: any): Item[];
  generateReward(type: string, level: number): Item;
}

export interface GeneratorOptions {
  type?: ItemType;
  quality?: ItemQuality;
  level?: Range;
  class?: string;
  spec?: string;
  slot?: string;
  affixes?: number;
  sockets?: number;
  warforged?: boolean;
  titanforged?: boolean;
  corruption?: boolean;
}

// Affixes for random generation
export interface ItemAffix {
  id: string;
  name: LocalizedString;
  type: 'prefix' | 'suffix';
  stats: StatModifier[];
  weight: number;
  minLevel: number;
  maxLevel: number;
  itemTypes: ItemType[];
  quality: ItemQuality[];
}

export interface ItemTemplate {
  id: string;
  baseItem: Partial<Item>;
  variations: ItemVariation[];
  affixPool: string[];
  socketChance: number;
  bonusChance: number;
}

export interface ItemVariation {
  id: string;
  chance: number;
  overrides: Partial<Item>;
}