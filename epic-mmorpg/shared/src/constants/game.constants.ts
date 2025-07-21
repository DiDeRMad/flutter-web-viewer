// Game Constants
export const GAME_VERSION = '1.0.0';
export const MAX_LEVEL = 100;
export const MAX_ITEM_LEVEL = 1000;
export const MAX_SKILL_LEVEL = 500;

// Character Constants
export const MAX_CHARACTER_NAME_LENGTH = 16;
export const MIN_CHARACTER_NAME_LENGTH = 2;
export const MAX_CHARACTERS_PER_ACCOUNT = 50;
export const MAX_CHARACTERS_PER_REALM = 12;

// Inventory Constants
export const DEFAULT_BAG_SLOTS = 16;
export const MAX_BAG_SLOTS = 36;
export const BANK_TAB_SLOTS = 98;
export const MAX_BANK_TABS = 8;

// Combat Constants
export const GLOBAL_COOLDOWN = 1500; // ms
export const MAX_RANGE_CHECK = 100; // yards
export const MELEE_RANGE = 5; // yards
export const DEFAULT_RESPAWN_TIME = 30000; // ms

// Party/Raid Constants
export const MAX_PARTY_SIZE = 5;
export const MAX_RAID_SIZE = 40;
export const MAX_BATTLEGROUND_SIZE = 40;
export const MAX_ARENA_TEAM_SIZE = 5;

// Guild Constants
export const MAX_GUILD_NAME_LENGTH = 24;
export const MAX_GUILD_MEMBERS = 1000;
export const MAX_GUILD_RANKS = 10;
export const GUILD_BANK_TABS = 8;

// Chat Constants
export const MAX_MESSAGE_LENGTH = 500;
export const CHAT_THROTTLE_TIME = 1000; // ms
export const MAX_CHAT_CHANNELS = 10;
export const WHISPER_RANGE = -1; // unlimited

// Trading Constants
export const MAX_TRADE_ITEMS = 7;
export const TRADE_DISTANCE = 10; // yards
export const AUCTION_HOUSE_CUT = 0.05; // 5%
export const MAX_AUCTION_TIME = 48 * 60 * 60 * 1000; // 48 hours

// PvP Constants
export const PVP_FLAG_DURATION = 5 * 60 * 1000; // 5 minutes
export const HONOR_KILL_RANGE = 100; // yards
export const DIMINISHING_RETURNS_DURATION = 18000; // ms
export const MAX_ARENA_RATING = 3000;

// World Constants
export const WORLD_UPDATE_RATE = 50; // ms
export const VIEW_DISTANCE_DEFAULT = 150; // yards
export const MAX_FALL_DISTANCE = 60; // yards
export const GHOST_SPEED_MODIFIER = 1.25;

// Experience Constants
export const XP_RATE_DEFAULT = 1.0;
export const REST_XP_RATE = 2.0;
export const MAX_REST_XP_PERCENT = 1.5;
export const XP_LOSS_ON_DEATH = 0;