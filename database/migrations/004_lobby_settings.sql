CREATE TABLE IF NOT EXISTS lobby_settings (
  lobby_id CHAR(36) NOT NULL PRIMARY KEY,
  password_hash VARCHAR(255) NULL,
  time_limit_seconds INT NULL,
  scoring VARCHAR(16) NOT NULL DEFAULT 'streak',
  target_sets INT NULL,
  allow_deal_extra TINYINT NOT NULL DEFAULT 1,
  CONSTRAINT fk_lobby_settings_lobby FOREIGN KEY (lobby_id) REFERENCES lobbies (id) ON DELETE CASCADE
);
