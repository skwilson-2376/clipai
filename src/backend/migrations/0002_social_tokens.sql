-- Social platform OAuth tokens (one row per platform)
CREATE TABLE IF NOT EXISTS social_tokens (
    platform          VARCHAR(20)  NOT NULL,
    access_token      TEXT         NOT NULL,
    refresh_token     TEXT,
    token_type        VARCHAR(50)  NOT NULL DEFAULT 'Bearer',
    scope             TEXT,
    expires_at        DATETIME,
    platform_user_id  VARCHAR(100),
    platform_username VARCHAR(100),
    connected_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
