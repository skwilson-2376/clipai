-- Add name and password_hash columns to users for email/password authentication
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS name          VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '';
