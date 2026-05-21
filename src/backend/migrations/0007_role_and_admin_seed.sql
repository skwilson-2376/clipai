-- role column already exists from initial setup
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Seed admin account (password: 12345678, SHA-256 hashed)
-- Uses INSERT IGNORE so re-running this migration is safe
INSERT IGNORE INTO users (id, name, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Admin',
    'admin@example.com',
    'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
    'admin'
);
