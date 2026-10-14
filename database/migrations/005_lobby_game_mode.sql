SET @exists := (
  SELECT COUNT(1) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'lobby_settings'
    AND column_name = 'game_mode'
);
SET @sql := IF(
  @exists = 0,
  'ALTER TABLE lobby_settings ADD COLUMN game_mode VARCHAR(16) NOT NULL DEFAULT ''classic''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
