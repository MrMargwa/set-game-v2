SET @exists := (
  SELECT COUNT(1) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'lobby_settings'
    AND column_name = 'deal_extra_size'
);
SET @sql := IF(
  @exists = 0,
  'ALTER TABLE lobby_settings
     ADD COLUMN deal_extra_size TINYINT NOT NULL DEFAULT 3,
     ADD COLUMN deck_size SMALLINT NOT NULL DEFAULT 81,
     ADD COLUMN board_columns TINYINT NOT NULL DEFAULT 5,
     ADD COLUMN initial_board_size TINYINT NOT NULL DEFAULT 15',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
