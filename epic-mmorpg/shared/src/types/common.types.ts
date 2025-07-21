// Common types used throughout the game

export type UUID = string;
export type Timestamp = number;
export type DateString = string;

export interface BaseEntity {
  id: UUID;
  createdAt: DateString;
  updatedAt: DateString;
}

export interface Coordinates2D {
  x: number;
  y: number;
}

export interface Coordinates3D extends Coordinates2D {
  z: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Transform {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

export interface Range {
  min: number;
  max: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface Sphere {
  center: Vector3;
  radius: number;
}

export interface Box {
  min: Vector3;
  max: Vector3;
}

export enum Direction {
  North = 'north',
  NorthEast = 'northeast',
  East = 'east',
  SouthEast = 'southeast',
  South = 'south',
  SouthWest = 'southwest',
  West = 'west',
  NorthWest = 'northwest'
}

export interface Pagination {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SearchOptions {
  query: string;
  fields?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Timestamp;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: Timestamp;
  id?: string;
}

export interface Notification {
  id: UUID;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  sound?: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: DateString;
  expiresAt?: DateString;
  data?: any;
}

export enum NotificationType {
  System = 'system',
  Achievement = 'achievement',
  Quest = 'quest',
  Combat = 'combat',
  Trade = 'trade',
  Guild = 'guild',
  Friend = 'friend',
  Mail = 'mail',
  Event = 'event',
  Warning = 'warning',
  Error = 'error'
}

export enum NotificationPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent'
}

export interface LocalizedString {
  en: string;
  [locale: string]: string;
}

export interface WeightedItem<T> {
  item: T;
  weight: number;
}

export interface Cooldown {
  id: string;
  duration: number;
  startTime: Timestamp;
  endTime: Timestamp;
  remaining?: number;
}

export interface Timer {
  id: string;
  duration: number;
  startTime: Timestamp;
  endTime: Timestamp;
  paused: boolean;
  pausedAt?: Timestamp;
  remaining?: number;
}

export interface Resource {
  current: number;
  max: number;
  regenRate?: number;
  regenInterval?: number;
}

export interface Stat {
  base: number;
  bonus: number;
  multiplier: number;
  total?: number;
}

export interface StatModifier {
  id: UUID;
  stat: string;
  value: number;
  type: ModifierType;
  source: string;
  duration?: number;
  stackable: boolean;
  maxStacks?: number;
  currentStacks?: number;
}

export enum ModifierType {
  Flat = 'flat',
  Percent = 'percent',
  Multiplier = 'multiplier'
}

export interface Requirement {
  type: RequirementType;
  value: any;
  operator?: ComparisonOperator;
}

export enum RequirementType {
  Level = 'level',
  Class = 'class',
  Race = 'race',
  Stat = 'stat',
  Skill = 'skill',
  Item = 'item',
  Quest = 'quest',
  Achievement = 'achievement',
  Reputation = 'reputation',
  Currency = 'currency'
}

export enum ComparisonOperator {
  Equal = '=',
  NotEqual = '!=',
  Greater = '>',
  GreaterEqual = '>=',
  Less = '<',
  LessEqual = '<=',
  In = 'in',
  NotIn = 'not_in',
  Contains = 'contains',
  NotContains = 'not_contains'
}

export interface Reward {
  type: RewardType;
  value: any;
  quantity?: number;
  chance?: number;
}

export enum RewardType {
  Experience = 'experience',
  Currency = 'currency',
  Item = 'item',
  Skill = 'skill',
  Title = 'title',
  Achievement = 'achievement',
  Reputation = 'reputation',
  Buff = 'buff',
  Unlock = 'unlock'
}

export interface Rarity {
  id: string;
  name: LocalizedString;
  color: Color;
  tier: number;
  dropRate: number;
}

export const RARITIES = {
  COMMON: { id: 'common', name: { en: 'Common' }, color: { r: 255, g: 255, b: 255 }, tier: 1, dropRate: 0.7 },
  UNCOMMON: { id: 'uncommon', name: { en: 'Uncommon' }, color: { r: 30, g: 255, b: 0 }, tier: 2, dropRate: 0.2 },
  RARE: { id: 'rare', name: { en: 'Rare' }, color: { r: 0, g: 112, b: 221 }, tier: 3, dropRate: 0.08 },
  EPIC: { id: 'epic', name: { en: 'Epic' }, color: { r: 163, g: 53, b: 238 }, tier: 4, dropRate: 0.019 },
  LEGENDARY: { id: 'legendary', name: { en: 'Legendary' }, color: { r: 255, g: 128, b: 0 }, tier: 5, dropRate: 0.001 },
  MYTHIC: { id: 'mythic', name: { en: 'Mythic' }, color: { r: 255, g: 0, b: 128 }, tier: 6, dropRate: 0.0001 }
} as const;

export type RarityType = keyof typeof RARITIES;