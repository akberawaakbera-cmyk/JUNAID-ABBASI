CREATE TABLE IF NOT EXISTS panel_users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT NOT NULL UNIQUE,
password_hash TEXT NOT NULL,
role TEXT NOT NULL DEFAULT ‘normal’
CHECK (role IN (‘developer’, ‘admin’, ‘normal’)),
is_active INTEGER NOT NULL DEFAULT 1,
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS panel_settings (
setting_key TEXT PRIMARY KEY,
setting_value TEXT NOT NULL,
updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT,
action TEXT NOT NULL,
details TEXT,
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO panel_settings
(setting_key, setting_value)
VALUES
(‘application_name’, ‘JUNAID ABBASI’),
(‘maintenance_mode’, ‘false’),
(‘registration_enabled’, ‘false’);