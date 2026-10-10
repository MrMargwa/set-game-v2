CREATE TABLE IF NOT EXISTS lobbies (
  id CHAR(36) NOT NULL PRIMARY KEY,
  host_user_id CHAR(36) NOT NULL,
  status ENUM('open', 'in_game', 'closed') NOT NULL DEFAULT 'open',
  max_players TINYINT NOT NULL DEFAULT 4,
  invite_code VARCHAR(8) NOT NULL,
  multiplayer_game_id CHAR(36) NULL,
  created_at DATETIME(3) NOT NULL,
  UNIQUE KEY uk_lobbies_invite (invite_code),
  KEY idx_lobbies_host (host_user_id),
  CONSTRAINT fk_lobbies_host FOREIGN KEY (host_user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lobby_players (
  lobby_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  seat_order TINYINT NOT NULL,
  joined_at DATETIME(3) NOT NULL,
  PRIMARY KEY (lobby_id, user_id),
  CONSTRAINT fk_lobby_players_lobby FOREIGN KEY (lobby_id) REFERENCES lobbies (id) ON DELETE CASCADE,
  CONSTRAINT fk_lobby_players_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS multiplayer_games (
  id CHAR(36) NOT NULL PRIMARY KEY,
  lobby_id CHAR(36) NOT NULL,
  mode_id VARCHAR(32) NOT NULL,
  version INT NOT NULL DEFAULT 0,
  status ENUM('playing', 'ended') NOT NULL DEFAULT 'playing',
  state_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  UNIQUE KEY uk_multiplayer_lobby (lobby_id),
  CONSTRAINT fk_multiplayer_lobby FOREIGN KEY (lobby_id) REFERENCES lobbies (id) ON DELETE CASCADE
);
