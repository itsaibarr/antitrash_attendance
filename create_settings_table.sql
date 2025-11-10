-- SQL script to create the settings table in Supabase
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default value for current_event
INSERT INTO settings (key, value) VALUES ('current_event', 'Default Event') ON CONFLICT (key) DO NOTHING;

-- Optional: Create an index for faster lookups
CREATE INDEX idx_settings_key ON settings (key);
