import { Color, Range, Vector3, LocalizedString } from './common.types';

export interface Weather {
  type: WeatherType;
  intensity: number;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  temperature: number;
  humidity: number;
  precipitation: number;
  cloudCoverage: number;
  lightningFrequency?: number;
  fogDensity?: number;
  effects: WeatherEffect[];
}

export enum WeatherType {
  Clear = 'clear',
  Cloudy = 'cloudy',
  Overcast = 'overcast',
  Fog = 'fog',
  Mist = 'mist',
  Drizzle = 'drizzle',
  Rain = 'rain',
  Storm = 'storm',
  Snow = 'snow',
  Blizzard = 'blizzard',
  Hail = 'hail',
  Sandstorm = 'sandstorm',
  AcidRain = 'acid_rain',
  MagicalStorm = 'magical_storm',
  Ashfall = 'ashfall',
  Aurora = 'aurora'
}

export interface WeatherEffect {
  type: string;
  value: number;
  targets: WeatherTargetType[];
}

export enum WeatherTargetType {
  Visibility = 'visibility',
  Movement = 'movement',
  Combat = 'combat',
  Magic = 'magic',
  Gathering = 'gathering',
  Flight = 'flight',
  Morale = 'morale'
}

export interface TimeOfDay {
  hour: number;
  minute: number;
  isDaytime: boolean;
  phase: DayPhase;
  sunPosition: Vector3;
  moonPosition: Vector3;
  starVisibility: number;
  ambientLight: Color;
  directionalLight: Color;
  shadowLength: number;
  temperature: number;
}

export enum DayPhase {
  Dawn = 'dawn',
  Morning = 'morning',
  Noon = 'noon',
  Afternoon = 'afternoon',
  Dusk = 'dusk',
  Evening = 'evening',
  Night = 'night',
  Midnight = 'midnight'
}

export interface Season {
  type: SeasonType;
  day: number;
  duration: number;
  weatherModifiers: WeatherModifier[];
  environmentalEffects: EnvironmentalEffect[];
  foliageState: FoliageState;
  temperatureRange: Range;
  daylightHours: Range;
  events: SeasonalEvent[];
}

export enum SeasonType {
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
  Winter = 'winter',
  Dry = 'dry',
  Wet = 'wet',
  Harvest = 'harvest',
  Planting = 'planting',
  Eternal = 'eternal',
  Chaotic = 'chaotic'
}

export interface WeatherModifier {
  weatherType: WeatherType;
  frequencyMultiplier: number;
  intensityMultiplier: number;
  durationMultiplier: number;
}

export interface EnvironmentalEffect {
  type: EnvironmentalEffectType;
  value: number;
  duration?: number;
  areas?: string[];
}

export enum EnvironmentalEffectType {
  Temperature = 'temperature',
  Humidity = 'humidity',
  Growth = 'growth',
  Decay = 'decay',
  Spawning = 'spawning',
  Migration = 'migration',
  Harvest = 'harvest',
  Disasters = 'disasters'
}

export enum FoliageState {
  Budding = 'budding',
  Blooming = 'blooming',
  Lush = 'lush',
  Changing = 'changing',
  Falling = 'falling',
  Bare = 'bare',
  Evergreen = 'evergreen',
  Magical = 'magical'
}

export interface SeasonalEvent {
  id: string;
  name: LocalizedString;
  startDay: number;
  duration: number;
  activities: string[];
  rewards: string[];
}

export interface WeatherSystem {
  currentWeather: Weather;
  forecast: WeatherForecast[];
  patterns: WeatherPattern[];
  anomalies: WeatherAnomaly[];
  magicalInfluences: MagicalWeatherInfluence[];
}

export interface WeatherForecast {
  time: number;
  weather: Weather;
  probability: number;
  duration: number;
}

export interface WeatherPattern {
  id: string;
  name: LocalizedString;
  conditions: Weather[];
  sequence: boolean;
  weights: number[];
  duration: Range;
  regions: string[];
}

export interface WeatherAnomaly {
  id: string;
  type: AnomalyType;
  position: Vector3;
  radius: number;
  weather: Weather;
  duration: number;
  mobile: boolean;
  velocity?: Vector3;
}

export enum AnomalyType {
  Natural = 'natural',
  Magical = 'magical',
  Dimensional = 'dimensional',
  Temporal = 'temporal',
  Cursed = 'cursed',
  Blessed = 'blessed'
}

export interface MagicalWeatherInfluence {
  source: string;
  type: string;
  power: number;
  range: number;
  effects: WeatherEffect[];
}

export interface DayNightCycle {
  currentTime: TimeOfDay;
  speed: number;
  paused: boolean;
  events: TimeEvent[];
  celestialBodies: CelestialBody[];
}

export interface TimeEvent {
  id: string;
  name: LocalizedString;
  triggerTime: DayPhase;
  duration: number;
  effects: string[];
  recurring: boolean;
}

export interface CelestialBody {
  id: string;
  name: LocalizedString;
  type: CelestialType;
  visible: boolean;
  position: Vector3;
  phase?: number;
  brightness: number;
  color: Color;
  size: number;
  effects: CelestialEffect[];
}

export enum CelestialType {
  Sun = 'sun',
  Moon = 'moon',
  Star = 'star',
  Planet = 'planet',
  Comet = 'comet',
  Constellation = 'constellation',
  Portal = 'portal',
  Anomaly = 'anomaly'
}

export interface CelestialEffect {
  type: string;
  value: number;
  conditions: string[];
}

export interface SeasonSystem {
  currentSeason: Season;
  yearDay: number;
  yearLength: number;
  transitions: SeasonTransition[];
  calendar: SeasonCalendar;
}

export interface SeasonTransition {
  from: SeasonType;
  to: SeasonType;
  duration: number;
  effects: TransitionEffect[];
}

export interface TransitionEffect {
  type: string;
  startValue: number;
  endValue: number;
  curve: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface SeasonCalendar {
  months: Month[];
  weeks: Week[];
  holidays: Holiday[];
  events: CalendarEvent[];
}

export interface Month {
  id: string;
  name: LocalizedString;
  days: number;
  season: SeasonType;
  events: string[];
}

export interface Week {
  days: WeekDay[];
  marketDay?: number;
  restDay?: number;
}

export interface WeekDay {
  id: string;
  name: LocalizedString;
  number: number;
  bonuses: DayBonus[];
}

export interface DayBonus {
  type: string;
  value: number;
  activities: string[];
}

export interface Holiday {
  id: string;
  name: LocalizedString;
  date: { month: number; day: number };
  duration: number;
  traditions: string[];
  decorations: string[];
  specialVendors: string[];
  quests: string[];
  achievements: string[];
}

export interface CalendarEvent {
  id: string;
  name: LocalizedString;
  date: { month: number; day: number };
  time?: { hour: number; minute: number };
  recurring: RecurrenceRule;
  duration: number;
  type: string;
  participants: string[];
  rewards: string[];
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  count?: number;
  until?: { month: number; day: number; year?: number };
  exceptions: { month: number; day: number }[];
}

// Zone-specific weather and environmental types
export interface ZoneWeather {
  baseWeather: Weather;
  variations: WeatherVariation[];
  microClimates: MicroClimate[];
  weatherZones: WeatherZone[];
}

export interface WeatherVariation {
  condition: string;
  modifier: WeatherModifier;
  probability: number;
}

export interface MicroClimate {
  id: string;
  area: Vector3[];
  weather: Weather;
  permanent: boolean;
  effects: EnvironmentalEffect[];
}

export interface WeatherZone {
  id: string;
  boundaries: Vector3[];
  weatherOverride?: Weather;
  modifiers: WeatherModifier[];
  immunities: WeatherType[];
}

export interface ZoneAmbience {
  sounds: AmbienceSound[];
  music: AmbienceMusic[];
  effects: AmbienceEffect[];
  triggers: AmbienceTrigger[];
}

export interface AmbienceSound {
  id: string;
  file: string;
  volume: number;
  radius: number;
  position?: Vector3;
  loop: boolean;
  random: boolean;
  interval?: Range;
  conditions: string[];
}

export interface AmbienceMusic {
  id: string;
  tracks: MusicTrack[];
  mode: 'sequential' | 'random' | 'adaptive';
  transitions: MusicTransition[];
}

export interface MusicTrack {
  id: string;
  file: string;
  mood: string;
  intensity: number;
  combat: boolean;
  exploration: boolean;
  conditions: string[];
}

export interface MusicTransition {
  from: string;
  to: string;
  type: 'crossfade' | 'cut' | 'bridge';
  duration: number;
}

export interface AmbienceEffect {
  type: string;
  intensity: number;
  area?: Vector3[];
  particles?: ParticleEffect;
  lighting?: LightingEffect;
  fog?: FogEffect;
}

export interface AmbienceTrigger {
  id: string;
  type: 'enter' | 'exit' | 'time' | 'weather' | 'event';
  condition: string;
  effects: string[];
  sounds?: string[];
  music?: string[];
}

export interface ZoneLighting {
  ambient: LightingProfile;
  directional: DirectionalLight;
  points: PointLight[];
  spots: SpotLight[];
  areas: AreaLight[];
  global: GlobalIllumination;
  shadows: ShadowSettings;
}

export interface LightingProfile {
  color: Color;
  intensity: number;
  skyColor: Color;
  horizonColor: Color;
  groundColor: Color;
  fogColor: Color;
}

export interface DirectionalLight {
  direction: Vector3;
  color: Color;
  intensity: number;
  shadows: boolean;
  shadowStrength: number;
}

export interface PointLight {
  id: string;
  position: Vector3;
  color: Color;
  intensity: number;
  radius: number;
  falloff: 'linear' | 'quadratic' | 'exponential';
  flicker?: FlickerSettings;
  shadows: boolean;
}

export interface SpotLight extends PointLight {
  direction: Vector3;
  angle: number;
  penumbra: number;
}

export interface AreaLight {
  id: string;
  shape: 'rectangle' | 'disk' | 'sphere';
  position: Vector3;
  size: Vector3;
  color: Color;
  intensity: number;
  softness: number;
}

export interface GlobalIllumination {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  bounces: number;
  intensity: number;
}

export interface ShadowSettings {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  distance: number;
  cascades: number;
  softness: number;
  bias: number;
}

export interface FlickerSettings {
  speed: number;
  intensity: Range;
  pattern?: number[];
}

export interface FogSettings {
  enabled: boolean;
  type: 'linear' | 'exponential' | 'exponential2';
  color: Color;
  density: number;
  start: number;
  end: number;
  height?: number;
  heightFalloff?: number;
  inscatteringColor?: Color;
  inscatteringIntensity?: number;
}

export interface ParticleEffect {
  id: string;
  type: string;
  emitters: ParticleEmitter[];
  duration: number;
  loop: boolean;
}

export interface ParticleEmitter {
  shape: EmitterShape;
  position: Vector3;
  rotation: Vector3;
  particlesPerSecond: number;
  lifetime: Range;
  speed: Range;
  size: Range;
  color: Color[];
  texture: string;
  blendMode: string;
  gravity: number;
  drag: number;
  randomness: number;
}

export interface EmitterShape {
  type: 'point' | 'sphere' | 'box' | 'cone' | 'mesh';
  size: Vector3;
  angle?: number;
  radius?: number;
}

export interface FogEffect {
  type: 'ground' | 'volumetric' | 'atmospheric';
  density: number;
  height: number;
  color: Color;
  animation?: FogAnimation;
}

export interface FogAnimation {
  speed: Vector3;
  turbulence: number;
  scale: number;
}