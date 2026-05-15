-- Add name and password_hash columns to users for email/password authentication
ALTER TABLE users
  ADD COLUMN name          VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';
