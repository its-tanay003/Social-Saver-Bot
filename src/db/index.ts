import { Database } from 'better-sqlite3';
import DatabaseConstructor from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize the database
const dbPath = path.join(process.cwd(), 'social_saver.db');
const db = new DatabaseConstructor(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize Schema
const schema = `
  CREATE TABLE IF NOT EXISTS saved_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    source TEXT NOT NULL,
    type TEXT NOT NULL,
    summary TEXT,
    tags TEXT,
    content TEXT,
    vibe TEXT,
    location_data TEXT,
    media_url TEXT,
    is_favorite BOOLEAN DEFAULT 0,
    notes TEXT,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'folder',
    color TEXT DEFAULT 'blue',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS collection_items (
    collection_id INTEGER,
    item_id INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, item_id),
    FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY(item_id) REFERENCES saved_items(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme_id TEXT DEFAULT 'default',
    font_id TEXT DEFAULT 'inter',
    layout_id TEXT DEFAULT 'grid',
    onboarding_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    items_saved INTEGER DEFAULT 0,
    items_remixed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_active_date TEXT
  );

  CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    condition_type TEXT NOT NULL,
    condition_value INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_badges (
    user_id INTEGER,
    badge_id TEXT,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id)
  );
  
  CREATE TABLE IF NOT EXISTS user_profile (
    user_id INTEGER PRIMARY KEY,
    full_name TEXT DEFAULT 'Guest User',
    dob TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_public BOOLEAN DEFAULT 0,
    social_links TEXT DEFAULT '{}',
    avatar_config TEXT DEFAULT '{"seed": "Alex", "top": "shortHair", "accessories": "none", "hairColor": "brown", "facialHair": "none", "clothing": "shirt", "skinColor": "light"}'
  );

  -- Seed initial data if empty
  INSERT OR IGNORE INTO user_settings (id, theme_id, onboarding_completed) VALUES (1, 'default', 0);
  INSERT OR IGNORE INTO user_stats (id, points) VALUES (1, 0);
  INSERT OR IGNORE INTO user_profile (user_id, full_name, email, avatar_url) VALUES (1, 'Alex Doe', 'alex@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex');
  
  INSERT OR IGNORE INTO badges (id, name, description, icon, condition_type, condition_value) VALUES 
  ('first_save', 'First Saver', 'Saved your first item', 'bookmark', 'items_saved', 1),
  ('power_user', 'Power User', 'Saved 10 items', 'zap', 'items_saved', 10),
  ('remix_master', 'Remix Master', 'Remixed 5 items', 'wand', 'items_remixed', 5),
  ('streak_week', 'On Fire', 'Used the app for 7 days in a row', 'flame', 'streak_days', 7);
`;

db.exec(schema);

export default db;
