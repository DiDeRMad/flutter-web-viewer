-- Epic Battle Arena Database Schema
-- Migration 001: Create Initial Tables

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL CHECK (length(username) >= 3),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('player', 'moderator', 'admin', 'developer')),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'elite', 'legendary')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    device_info JSONB,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);

-- Player Profiles
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(64) NOT NULL,
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    experience BIGINT DEFAULT 0 CHECK (experience >= 0),
    experience_to_next INTEGER DEFAULT 100,
    character_class VARCHAR(20) NOT NULL CHECK (character_class IN ('warrior', 'archer', 'mage', 'paladin', 'assassin', 'necromancer')),
    avatar_url VARCHAR(512),
    title VARCHAR(100),
    signature TEXT,
    locale VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE,
    current_match_id UUID,
    total_playtime_seconds BIGINT DEFAULT 0,
    
    UNIQUE(user_id)
);

-- Player Statistics
CREATE TABLE player_statistics (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    
    -- Combat Statistics
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    win_rate DECIMAL(5,4) GENERATED ALWAYS AS (
        CASE WHEN total_matches > 0 THEN 
            ROUND(wins::decimal / total_matches::decimal, 4)
        ELSE 0 END
    ) STORED,
    
    total_kills INTEGER DEFAULT 0,
    total_deaths INTEGER DEFAULT 0,
    total_assists INTEGER DEFAULT 0,
    kill_death_ratio DECIMAL(6,3) GENERATED ALWAYS AS (
        CASE WHEN total_deaths > 0 THEN 
            ROUND(total_kills::decimal / total_deaths::decimal, 3)
        ELSE total_kills::decimal END
    ) STORED,
    
    total_damage BIGINT DEFAULT 0,
    total_healing BIGINT DEFAULT 0,
    highest_kill_streak INTEGER DEFAULT 0,
    current_kill_streak INTEGER DEFAULT 0,
    
    -- Game Mode Statistics
    battle_royale_wins INTEGER DEFAULT 0,
    battle_royale_matches INTEGER DEFAULT 0,
    team_deathmatch_wins INTEGER DEFAULT 0,
    team_deathmatch_matches INTEGER DEFAULT 0,
    arena_1v1_wins INTEGER DEFAULT 0,
    arena_1v1_matches INTEGER DEFAULT 0,
    conquest_wins INTEGER DEFAULT 0,
    conquest_matches INTEGER DEFAULT 0,
    
    -- Economic Statistics
    total_gold_earned BIGINT DEFAULT 0,
    total_gold_spent BIGINT DEFAULT 0,
    total_gems_earned INTEGER DEFAULT 0,
    total_gems_spent INTEGER DEFAULT 0,
    market_transactions INTEGER DEFAULT 0,
    
    -- Social Statistics
    friends_count INTEGER DEFAULT 0,
    guild_contributions INTEGER DEFAULT 0,
    
    -- Class-specific Statistics
    favorite_class VARCHAR(20),
    class_playtime JSONB DEFAULT '{}',
    class_wins JSONB DEFAULT '{}',
    
    -- Map Statistics
    favorite_map VARCHAR(100),
    map_wins JSONB DEFAULT '{}',
    map_playtime JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player Stats (Character Attributes)
CREATE TABLE player_stats (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    
    -- Current Values
    health INTEGER DEFAULT 100 CHECK (health >= 0),
    max_health INTEGER DEFAULT 100 CHECK (max_health > 0),
    mana INTEGER DEFAULT 100 CHECK (mana >= 0),
    max_mana INTEGER DEFAULT 100 CHECK (max_mana > 0),
    stamina INTEGER DEFAULT 100 CHECK (stamina >= 0),
    max_stamina INTEGER DEFAULT 100 CHECK (max_stamina > 0),
    
    -- Core Attributes
    strength INTEGER DEFAULT 10 CHECK (strength > 0),
    agility INTEGER DEFAULT 10 CHECK (agility > 0),
    intelligence INTEGER DEFAULT 10 CHECK (intelligence > 0),
    vitality INTEGER DEFAULT 10 CHECK (vitality > 0),
    luck INTEGER DEFAULT 10 CHECK (luck > 0),
    
    -- Combat Stats
    attack_power INTEGER DEFAULT 50,
    spell_power INTEGER DEFAULT 50,
    defense INTEGER DEFAULT 20,
    magic_resistance INTEGER DEFAULT 20,
    critical_chance DECIMAL(5,4) DEFAULT 0.05 CHECK (critical_chance >= 0 AND critical_chance <= 1),
    critical_damage DECIMAL(5,4) DEFAULT 1.5 CHECK (critical_damage >= 1),
    attack_speed DECIMAL(5,4) DEFAULT 1.0 CHECK (attack_speed > 0),
    movement_speed INTEGER DEFAULT 300 CHECK (movement_speed > 0),
    
    -- Special Stats
    life_steal DECIMAL(5,4) DEFAULT 0 CHECK (life_steal >= 0 AND life_steal <= 1),
    mana_steal DECIMAL(5,4) DEFAULT 0 CHECK (mana_steal >= 0 AND mana_steal <= 1),
    cooldown_reduction DECIMAL(5,4) DEFAULT 0 CHECK (cooldown_reduction >= 0 AND cooldown_reduction <= 0.8),
    experience_bonus DECIMAL(5,4) DEFAULT 0 CHECK (experience_bonus >= 0),
    gold_bonus DECIMAL(5,4) DEFAULT 0 CHECK (gold_bonus >= 0),
    
    -- Calculated derived stats
    total_power INTEGER GENERATED ALWAYS AS (
        (strength + agility + intelligence + vitality + luck) * 2 + attack_power + spell_power
    ) STORED,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items Database
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('weapon', 'armor', 'accessory', 'consumable', 'crafting_material', 'gem', 'quest_item', 'cosmetic', 'pet', 'mount')),
    sub_type VARCHAR(30),
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine')),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    item_level INTEGER DEFAULT 1 CHECK (item_level >= 1),
    
    -- Requirements
    required_level INTEGER DEFAULT 1,
    required_character_classes VARCHAR(200),
    required_strength INTEGER DEFAULT 0,
    required_agility INTEGER DEFAULT 0,
    required_intelligence INTEGER DEFAULT 0,
    required_vitality INTEGER DEFAULT 0,
    required_quests_completed JSONB DEFAULT '[]',
    required_achievements JSONB DEFAULT '[]',
    
    -- Item Properties
    stats JSONB DEFAULT '{}', -- {strength: 10, agility: 5, etc}
    effects JSONB DEFAULT '[]', -- Array of effect objects
    value INTEGER DEFAULT 0 CHECK (value >= 0),
    max_stack INTEGER DEFAULT 1 CHECK (max_stack >= 1),
    is_stackable BOOLEAN GENERATED ALWAYS AS (max_stack > 1) STORED,
    is_tradeable BOOLEAN DEFAULT TRUE,
    is_sellable BOOLEAN DEFAULT TRUE,
    is_droppable BOOLEAN DEFAULT TRUE,
    is_consumable BOOLEAN DEFAULT FALSE,
    
    -- Durability
    max_durability INTEGER,
    durability_cost_per_use INTEGER DEFAULT 1,
    
    -- Sockets and Enhancement
    gem_sockets INTEGER DEFAULT 0 CHECK (gem_sockets >= 0 AND gem_sockets <= 6),
    max_enchantment_level INTEGER DEFAULT 0,
    enchantment_cost_base INTEGER DEFAULT 100,
    
    -- Visual
    icon_url VARCHAR(512) NOT NULL,
    model_url VARCHAR(512),
    animation_set VARCHAR(100),
    color_tint VARCHAR(7), -- Hex color
    glow_effect VARCHAR(50),
    
    -- Set Information
    item_set_id UUID,
    set_piece_number INTEGER,
    
    -- Crafting
    is_craftable BOOLEAN DEFAULT FALSE,
    crafting_recipe_id UUID,
    
    -- Meta
    is_active BOOLEAN DEFAULT TRUE,
    is_event_item BOOLEAN DEFAULT FALSE,
    event_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(name)
);

-- Player Inventory
CREATE TABLE player_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    slot_position INTEGER DEFAULT -1, -- -1 means not assigned to hotbar
    is_equipped BOOLEAN DEFAULT FALSE,
    equipment_slot VARCHAR(20), -- helmet, chest, weapon, etc.
    
    -- Item Instance Properties
    enchantment_level INTEGER DEFAULT 0,
    current_durability INTEGER,
    gem_sockets JSONB DEFAULT '[]', -- Array of gem_id or null for empty sockets
    bound_to_player BOOLEAN DEFAULT FALSE,
    custom_name VARCHAR(100),
    custom_description TEXT,
    
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(player_id, slot_position) WHERE slot_position >= 0,
    UNIQUE(player_id, equipment_slot) WHERE is_equipped = TRUE,
    
    CHECK ((is_equipped AND equipment_slot IS NOT NULL) OR (NOT is_equipped AND equipment_slot IS NULL))
);

-- Player Economy
CREATE TABLE player_economy (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    gold BIGINT DEFAULT 1000 CHECK (gold >= 0),
    gems INTEGER DEFAULT 0 CHECK (gems >= 0),
    tokens INTEGER DEFAULT 0 CHECK (tokens >= 0),
    premium_currency INTEGER DEFAULT 0 CHECK (premium_currency >= 0),
    
    -- Lifetime tracking
    total_gold_earned BIGINT DEFAULT 0,
    total_gold_spent BIGINT DEFAULT 0,
    total_gems_earned INTEGER DEFAULT 0,
    total_gems_spent INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills and Abilities
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    character_class VARCHAR(20) NOT NULL,
    skill_tree VARCHAR(50) NOT NULL,
    tier INTEGER DEFAULT 1 CHECK (tier >= 1 AND tier <= 10),
    max_level INTEGER DEFAULT 10 CHECK (max_level >= 1),
    
    -- Requirements
    required_level INTEGER DEFAULT 1,
    required_skill_points INTEGER DEFAULT 1,
    prerequisite_skills JSONB DEFAULT '[]',
    
    -- Skill Properties
    skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('active', 'passive', 'ultimate', 'enhancement')),
    cooldown_seconds DECIMAL(6,2) DEFAULT 0,
    mana_cost INTEGER DEFAULT 0,
    stamina_cost INTEGER DEFAULT 0,
    casting_time_ms INTEGER DEFAULT 0,
    range_units INTEGER DEFAULT 0,
    area_of_effect INTEGER DEFAULT 0,
    
    -- Effects per level
    effects_per_level JSONB NOT NULL DEFAULT '[]',
    damage_scaling JSONB DEFAULT '{}',
    
    -- Visual and Audio
    icon_url VARCHAR(512) NOT NULL,
    animation_name VARCHAR(100),
    sound_effect VARCHAR(100),
    visual_effect VARCHAR(100),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player Skills
CREATE TABLE player_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 0 CHECK (current_level >= 0),
    experience INTEGER DEFAULT 0 CHECK (experience >= 0),
    is_equipped BOOLEAN DEFAULT FALSE,
    hotkey_slot INTEGER CHECK (hotkey_slot >= 1 AND hotkey_slot <= 12),
    
    learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    UNIQUE(player_id, skill_id),
    UNIQUE(player_id, hotkey_slot) WHERE is_equipped = TRUE
);

-- Game Matches
CREATE TABLE game_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_mode VARCHAR(30) NOT NULL CHECK (game_mode IN ('battle_royale', 'team_deathmatch', 'conquest', 'guild_war', 'pve_dungeon', 'arena_1v1', 'capture_the_flag', 'king_of_the_hill')),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'in_progress', 'finished', 'cancelled')),
    map_id UUID NOT NULL,
    
    max_players INTEGER NOT NULL CHECK (max_players > 0),
    current_players INTEGER DEFAULT 0 CHECK (current_players >= 0),
    min_players_to_start INTEGER DEFAULT 2,
    
    -- Match Settings
    time_limit_seconds INTEGER DEFAULT 600,
    score_limit INTEGER DEFAULT 100,
    friendly_fire BOOLEAN DEFAULT FALSE,
    respawn_time_seconds INTEGER DEFAULT 5,
    starting_equipment JSONB DEFAULT '[]',
    allowed_classes JSONB DEFAULT '[]',
    pvp_enabled BOOLEAN DEFAULT TRUE,
    spectating_allowed BOOLEAN DEFAULT TRUE,
    chat_enabled BOOLEAN DEFAULT TRUE,
    custom_rules JSONB DEFAULT '{}',
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Results
    winner_type VARCHAR(20), -- 'player', 'team', 'guild'
    winner_id UUID,
    winner_data JSONB,
    final_scores JSONB DEFAULT '{}',
    
    -- Server Information
    server_id VARCHAR(100),
    server_region VARCHAR(50),
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match Players (participants)
CREATE TABLE match_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES game_matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    
    -- Player state in match
    character_class VARCHAR(20) NOT NULL,
    level INTEGER NOT NULL,
    team_number INTEGER,
    is_ready BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    
    -- Match Performance
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    damage_dealt BIGINT DEFAULT 0,
    damage_taken BIGINT DEFAULT 0,
    healing_done BIGINT DEFAULT 0,
    
    -- Timing
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    total_playtime_seconds INTEGER DEFAULT 0,
    
    -- Network
    average_ping INTEGER DEFAULT 0,
    packet_loss_percent DECIMAL(5,4) DEFAULT 0,
    
    -- Final Results
    final_position INTEGER, -- For battle royale, etc.
    experience_gained INTEGER DEFAULT 0,
    gold_earned INTEGER DEFAULT 0,
    items_received JSONB DEFAULT '[]',
    
    UNIQUE(match_id, player_id)
);

-- Match Events (for replay and analysis)
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES game_matches(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    target_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    
    timestamp_ms BIGINT NOT NULL, -- Relative to match start
    position_x DECIMAL(10,3),
    position_y DECIMAL(10,3),
    position_z DECIMAL(10,3),
    
    event_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for game_matches and related tables
CREATE INDEX idx_game_matches_status ON game_matches(status);
CREATE INDEX idx_game_matches_game_mode ON game_matches(game_mode);
CREATE INDEX idx_game_matches_created_at ON game_matches(created_at);
CREATE INDEX idx_match_players_match_id ON match_players(match_id);
CREATE INDEX idx_match_players_player_id ON match_players(player_id);
CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_match_events_timestamp ON match_events(timestamp_ms);

-- Maps
CREATE TABLE game_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(512),
    
    max_players INTEGER NOT NULL CHECK (max_players > 0),
    recommended_players INTEGER,
    supported_game_modes JSONB NOT NULL DEFAULT '[]',
    
    size VARCHAR(20) NOT NULL CHECK (size IN ('small', 'medium', 'large', 'massive')),
    terrain_type VARCHAR(20) NOT NULL CHECK (terrain_type IN ('forest', 'desert', 'mountains', 'urban', 'winter', 'volcanic', 'underwater', 'space')),
    weather_type VARCHAR(20) DEFAULT 'clear' CHECK (weather_type IN ('clear', 'rain', 'snow', 'fog', 'storm', 'sandstorm')),
    time_of_day VARCHAR(20) DEFAULT 'day' CHECK (time_of_day IN ('dawn', 'day', 'dusk', 'night')),
    
    -- Map Data
    spawn_points JSONB NOT NULL DEFAULT '[]',
    objectives JSONB DEFAULT '[]',
    hazards JSONB DEFAULT '[]',
    resources JSONB DEFAULT '[]',
    boundaries JSONB NOT NULL DEFAULT '{}',
    
    -- Files
    map_file_url VARCHAR(512),
    navmesh_file_url VARCHAR(512),
    collision_file_url VARCHAR(512),
    minimap_url VARCHAR(512),
    
    -- Meta
    version VARCHAR(20) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    difficulty_rating INTEGER DEFAULT 1 CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guilds
CREATE TABLE guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL UNIQUE,
    tag VARCHAR(8) NOT NULL UNIQUE,
    description TEXT,
    
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    experience BIGINT DEFAULT 0,
    experience_to_next INTEGER DEFAULT 1000,
    
    owner_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 50 CHECK (max_members >= 5 AND max_members <= 200),
    current_members INTEGER DEFAULT 1,
    
    treasury BIGINT DEFAULT 0 CHECK (treasury >= 0),
    reputation INTEGER DEFAULT 0,
    
    -- Visual
    icon_url VARCHAR(512),
    banner_url VARCHAR(512),
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7), -- Hex color
    
    -- Settings
    is_public BOOLEAN DEFAULT TRUE,
    is_recruiting BOOLEAN DEFAULT TRUE,
    required_level INTEGER DEFAULT 1,
    required_power_level INTEGER DEFAULT 0,
    application_required BOOLEAN DEFAULT FALSE,
    invite_only BOOLEAN DEFAULT FALSE,
    
    -- Statistics
    total_wars INTEGER DEFAULT 0,
    wars_won INTEGER DEFAULT 0,
    guild_points INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guild Members
CREATE TABLE guild_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'officer', 'leader', 'founder')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contributions
    contribution_points INTEGER DEFAULT 0,
    weekly_contribution INTEGER DEFAULT 0,
    total_contribution INTEGER DEFAULT 0,
    
    -- Permissions (for officers+)
    can_invite BOOLEAN DEFAULT FALSE,
    can_kick BOOLEAN DEFAULT FALSE,
    can_promote BOOLEAN DEFAULT FALSE,
    can_manage_treasury BOOLEAN DEFAULT FALSE,
    can_start_wars BOOLEAN DEFAULT FALSE,
    
    -- Activity
    last_contribution_at TIMESTAMP WITH TIME ZONE,
    activity_score INTEGER DEFAULT 100,
    
    UNIQUE(player_id) -- Player can only be in one guild
);

-- Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('combat', 'exploration', 'social', 'crafting', 'collection', 'progression', 'special')),
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine')),
    
    points INTEGER DEFAULT 10 CHECK (points > 0),
    is_secret BOOLEAN DEFAULT FALSE,
    is_repeatable BOOLEAN DEFAULT FALSE,
    
    -- Requirements (stored as conditions)
    requirements JSONB NOT NULL DEFAULT '[]',
    
    -- Rewards
    rewards JSONB DEFAULT '[]',
    
    -- Visual
    icon_url VARCHAR(512) NOT NULL,
    unlock_animation VARCHAR(100),
    
    -- Meta
    is_active BOOLEAN DEFAULT TRUE,
    is_event_achievement BOOLEAN DEFAULT FALSE,
    event_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player Achievements
CREATE TABLE player_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    
    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    
    unlocked_at TIMESTAMP WITH TIME ZONE,
    notified BOOLEAN DEFAULT FALSE,
    
    -- For repeatable achievements
    completion_count INTEGER DEFAULT 0,
    last_completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(player_id, achievement_id)
);

-- Friends System
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- Chat Channels
CREATE TABLE chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('global', 'guild', 'party', 'private', 'custom')),
    description TEXT,
    
    owner_id UUID REFERENCES players(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 100,
    current_members INTEGER DEFAULT 0,
    
    is_public BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT TRUE,
    password_hash VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES players(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'emote', 'system', 'whisper', 'announcement')),
    
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_action VARCHAR(20),
    moderated_by UUID REFERENCES players(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK ((channel_id IS NOT NULL AND recipient_id IS NULL) OR (channel_id IS NULL AND recipient_id IS NOT NULL))
);

-- Marketplace
CREATE TABLE market_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit BIGINT NOT NULL CHECK (price_per_unit > 0),
    total_price BIGINT GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
    currency VARCHAR(20) NOT NULL DEFAULT 'gold' CHECK (currency IN ('gold', 'gems', 'tokens', 'premium')),
    
    listing_type VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (listing_type IN ('fixed', 'auction', 'offer')),
    duration_hours INTEGER NOT NULL DEFAULT 24 CHECK (duration_hours > 0),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
    
    -- Auction specific
    starting_bid BIGINT,
    current_bid BIGINT,
    highest_bidder_id UUID REFERENCES players(id) ON DELETE SET NULL,
    bid_count INTEGER DEFAULT 0,
    
    -- Fees
    listing_fee BIGINT DEFAULT 0,
    success_fee_percent DECIMAL(5,4) DEFAULT 0.05,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE
);

-- Market Transactions
CREATE TABLE market_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES market_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL,
    unit_price BIGINT NOT NULL,
    total_price BIGINT NOT NULL,
    currency VARCHAR(20) NOT NULL,
    
    fees BIGINT DEFAULT 0,
    net_amount BIGINT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Sessions (for analytics)
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Session data
    ip_address INET,
    user_agent TEXT,
    client_version VARCHAR(50),
    platform VARCHAR(50),
    
    -- Activity during session
    matches_played INTEGER DEFAULT 0,
    experience_gained INTEGER DEFAULT 0,
    gold_earned INTEGER DEFAULT 0,
    items_acquired INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_fps INTEGER,
    average_ping INTEGER,
    disconnect_count INTEGER DEFAULT 0,
    crash_count INTEGER DEFAULT 0
);

-- Create essential indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_verified ON users(verified);
CREATE INDEX idx_users_is_banned ON users(is_banned);

CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_display_name ON players(display_name);
CREATE INDEX idx_players_level ON players(level);
CREATE INDEX idx_players_character_class ON players(character_class);
CREATE INDEX idx_players_is_online ON players(is_online);
CREATE INDEX idx_players_last_seen_at ON players(last_seen_at);

CREATE INDEX idx_player_inventory_player_id ON player_inventory(player_id);
CREATE INDEX idx_player_inventory_item_id ON player_inventory(item_id);
CREATE INDEX idx_player_inventory_is_equipped ON player_inventory(is_equipped);

CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_rarity ON items(rarity);
CREATE INDEX idx_items_level ON items(level);
CREATE INDEX idx_items_is_active ON items(is_active);

CREATE INDEX idx_guilds_name ON guilds(name);
CREATE INDEX idx_guilds_tag ON guilds(tag);
CREATE INDEX idx_guilds_is_public ON guilds(is_public);
CREATE INDEX idx_guilds_level ON guilds(level);

CREATE INDEX idx_guild_members_guild_id ON guild_members(guild_id);
CREATE INDEX idx_guild_members_player_id ON guild_members(player_id);
CREATE INDEX idx_guild_members_role ON guild_members(role);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_is_active ON achievements(is_active);

CREATE INDEX idx_player_achievements_player_id ON player_achievements(player_id);
CREATE INDEX idx_player_achievements_achievement_id ON player_achievements(achievement_id);
CREATE INDEX idx_player_achievements_is_completed ON player_achievements(is_completed);

CREATE INDEX idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);

CREATE INDEX idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_recipient_id ON chat_messages(recipient_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_market_listings_seller_id ON market_listings(seller_id);
CREATE INDEX idx_market_listings_item_id ON market_listings(item_id);
CREATE INDEX idx_market_listings_status ON market_listings(status);
CREATE INDEX idx_market_listings_expires_at ON market_listings(expires_at);

CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at);