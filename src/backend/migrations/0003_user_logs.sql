-- Free sign-up audit log
CREATE TABLE IF NOT EXISTS user_logs (
    id         CHAR(36)     NOT NULL DEFAULT (UUID()),
    event      VARCHAR(50)  NOT NULL DEFAULT 'signup_free',
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    plan       VARCHAR(50)  NOT NULL DEFAULT 'free',
    ip         VARCHAR(45),
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_event   (event),
    INDEX idx_email   (email),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
