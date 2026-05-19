-- Update admin account with production credentials
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Admin',
    'admin@clipai.app',
    '9fc351ad6cde3f7869a004615fb1375961c01a65b2ad65e12ce2f58ac923abd3',
    'admin'
)
ON DUPLICATE KEY UPDATE
    email         = VALUES(email),
    password_hash = VALUES(password_hash),
    role          = VALUES(role);
