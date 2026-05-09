-- ClipAI database schema
-- Database: clipaiapp

CREATE TABLE IF NOT EXISTS users (
    id         VARCHAR(36)  PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS characters (
    id          VARCHAR(36)  PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    source      ENUM('ai','uploaded') NOT NULL,
    image_url   TEXT,
    description TEXT,
    gradient    TEXT         NOT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generations (
    id                VARCHAR(36)   PRIMARY KEY,
    prompt            TEXT          NOT NULL,
    style             ENUM('realistic','anime','3d') NOT NULL,
    aspect_ratio      ENUM('9:16','1:1','16:9')      NOT NULL,
    platform          ENUM('TikTok','Reels','Shorts','Twitter') NOT NULL,
    resolution        ENUM('720p','1080p','4K','Auto')          NOT NULL,
    duration          INT           NOT NULL DEFAULT 8,
    motion_intensity  INT           NOT NULL DEFAULT 65,
    creativity        INT           NOT NULL DEFAULT 7,
    status            ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
    progress          INT           NOT NULL DEFAULT 0,
    video_url         TEXT,
    thumbnail_gradient TEXT,
    is_uploaded       TINYINT(1)   NOT NULL DEFAULT 0,
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stories (
    id            VARCHAR(36)  PRIMARY KEY,
    generation_id VARCHAR(36),
    title         VARCHAR(500) NOT NULL,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generation_id) REFERENCES generations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS story_scenes (
    id           VARCHAR(36) PRIMARY KEY,
    story_id     VARCHAR(36) NOT NULL,
    scene_order  INT         NOT NULL,
    narration    TEXT        NOT NULL,
    character_id VARCHAR(36),
    dialogue     TEXT,
    duration     INT         NOT NULL DEFAULT 5,
    FOREIGN KEY (story_id)     REFERENCES stories(id)    ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS generation_characters (
    generation_id VARCHAR(36) NOT NULL,
    character_id  VARCHAR(36) NOT NULL,
    PRIMARY KEY (generation_id, character_id),
    FOREIGN KEY (generation_id) REFERENCES generations(id)  ON DELETE CASCADE,
    FOREIGN KEY (character_id)  REFERENCES characters(id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
    id            VARCHAR(36) PRIMARY KEY,
    generation_id VARCHAR(36) NOT NULL,
    platforms     VARCHAR(255) NOT NULL,   -- comma-separated platform list
    caption       TEXT,
    status        ENUM('pending','posted','failed') NOT NULL DEFAULT 'pending',
    posted_at     TIMESTAMP,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generation_id) REFERENCES generations(id) ON DELETE CASCADE
);
