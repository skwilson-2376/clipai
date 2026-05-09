-- Run once:  mysql -u root -p < setup-local-db.sql

CREATE DATABASE IF NOT EXISTS clipaiapp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'clipai'@'localhost' IDENTIFIED BY 'clipai_dev';

GRANT ALL PRIVILEGES ON clipaiapp.* TO 'clipai'@'localhost';

FLUSH PRIVILEGES;

SELECT 'Database clipaiapp and user clipai created.' AS result;
