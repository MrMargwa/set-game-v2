-- M5: snellere leaderboard-queries per mode
CREATE INDEX idx_game_sessions_mode_score
  ON game_sessions (mode_id, final_score DESC, valid_sets_found DESC);
