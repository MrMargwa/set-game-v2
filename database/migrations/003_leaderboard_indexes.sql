-- M5: snellere leaderboard-queries per mode
SET @exists := (
  SELECT COUNT(1) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'game_sessions'
    AND index_name = 'idx_game_sessions_mode_score'
);
SET @sql := IF(
  @exists = 0,
  'CREATE INDEX idx_game_sessions_mode_score ON game_sessions (mode_id, final_score DESC, valid_sets_found DESC)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
