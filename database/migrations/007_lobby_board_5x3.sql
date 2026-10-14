UPDATE lobby_settings
SET initial_board_size = 15
WHERE board_columns = 5 AND initial_board_size = 12;

ALTER TABLE lobby_settings
  ALTER COLUMN initial_board_size SET DEFAULT 15;
