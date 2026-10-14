import type { RowDataPacket } from "mysql2";
import { getPool } from "@/infrastructure/database/client";
import type { UserId } from "@/modules/accounts/domain/user";
import {
  CLASSIC_DEFAULT_SECONDS,
  type LobbyDealExtraSize,
  type LobbyDeckSize,
  type LobbyMode,
} from "../domain/lobby-settings";

export type LobbyStatus = "open" | "in_game" | "closed";

export type LobbyRow = {
  id: string;
  hostUserId: UserId;
  status: LobbyStatus;
  maxPlayers: number;
  inviteCode: string;
  multiplayerGameId: string | null;
  createdAt: Date;
  passwordHash: string | null;
  timeLimitSeconds: number | null;
  gameMode: LobbyMode;
  dealExtraSize: number | null;
  deckSize: number | null;
  boardColumns: number | null;
  initialBoardSize: number | null;
};

export type LobbyPlayerRow = {
  userId: UserId;
  username: string;
  seatOrder: number;
};

type LobbyDbRow = RowDataPacket & {
  id: string;
  host_user_id: string;
  status: LobbyStatus;
  max_players: number;
  invite_code: string;
  multiplayer_game_id: string | null;
  created_at: Date;
  password_hash: string | null;
  time_limit_seconds: number | null;
  game_mode: string | null;
  deal_extra_size: number | null;
  deck_size: number | null;
  board_columns: number | null;
  initial_board_size: number | null;
};

type PlayerDbRow = RowDataPacket & {
  user_id: string;
  username: string;
  seat_order: number;
};

export class LobbyRepository {
  async create(hostUserId: UserId, inviteCode: string): Promise<LobbyRow> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const id = crypto.randomUUID();
    const now = new Date();
    await pool.execute(
      `INSERT INTO lobbies (id, host_user_id, status, max_players, invite_code, created_at)
       VALUES (?, ?, 'open', 4, ?, ?)`,
      [id, hostUserId, inviteCode, now],
    );
    await pool.execute(
      `INSERT INTO lobby_players (lobby_id, user_id, seat_order, joined_at)
       VALUES (?, ?, 0, ?)`,
      [id, hostUserId, now],
    );
    await pool.execute(
      `INSERT INTO lobby_settings (
         lobby_id, time_limit_seconds, scoring, allow_deal_extra, game_mode,
         deal_extra_size, deck_size, board_columns, initial_board_size
       ) VALUES (?, ?, 'streak', 1, 'classic', 3, 81, 5, 15)`,
      [id, CLASSIC_DEFAULT_SECONDS],
    );

    return {
      id,
      hostUserId,
      status: "open",
      maxPlayers: 4,
      inviteCode,
      multiplayerGameId: null,
      createdAt: now,
      passwordHash: null,
      timeLimitSeconds: CLASSIC_DEFAULT_SECONDS,
      gameMode: "classic",
      dealExtraSize: 3,
      deckSize: 81,
      boardColumns: 5,
      initialBoardSize: 15,
    };
  }

  async findById(lobbyId: string): Promise<LobbyRow | null> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const [rows] = await pool.execute<LobbyDbRow[]>(
      `${LOBBY_SELECT} WHERE l.id = ? LIMIT 1`,
      [lobbyId],
    );
    const row = rows[0];
    if (!row) return null;
    return mapLobby(row);
  }

  async findByInviteCode(inviteCode: string): Promise<LobbyRow | null> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const [rows] = await pool.execute<LobbyDbRow[]>(
      `${LOBBY_SELECT} WHERE l.invite_code = ? LIMIT 1`,
      [inviteCode.toUpperCase()],
    );
    const row = rows[0];
    if (!row) return null;
    return mapLobby(row);
  }

  async listPlayers(lobbyId: string): Promise<LobbyPlayerRow[]> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const [rows] = await pool.execute<PlayerDbRow[]>(
      `SELECT lp.user_id, u.username, lp.seat_order
       FROM lobby_players lp
       INNER JOIN users u ON u.id = lp.user_id
       WHERE lp.lobby_id = ?
       ORDER BY lp.seat_order ASC`,
      [lobbyId],
    );

    return rows.map((r) => ({
      userId: r.user_id,
      username: r.username,
      seatOrder: r.seat_order,
    }));
  }

  async addPlayer(lobbyId: string, userId: UserId): Promise<void> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS c FROM lobby_players WHERE lobby_id = ?`,
      [lobbyId],
    );
    const seatOrder = Number(countRows[0]?.c ?? 0);

    await pool.execute(
      `INSERT INTO lobby_players (lobby_id, user_id, seat_order, joined_at)
       VALUES (?, ?, ?, ?)`,
      [lobbyId, userId, seatOrder, new Date()],
    );
  }

  async isPlayer(lobbyId: string, userId: UserId): Promise<boolean> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM lobby_players WHERE lobby_id = ? AND user_id = ? LIMIT 1`,
      [lobbyId, userId],
    );
    return rows.length > 0;
  }

  async updateSettings(
    lobbyId: string,
    input: {
      maxPlayers: number;
      passwordHash?: string | null;
      timeLimitSeconds: number;
      gameMode: LobbyMode;
      dealExtraSize: LobbyDealExtraSize;
      deckSize: LobbyDeckSize;
      boardColumns: number;
      initialBoardSize: number;
    },
  ): Promise<void> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    await pool.execute(`UPDATE lobbies SET max_players = ? WHERE id = ?`, [
      input.maxPlayers,
      lobbyId,
    ]);

    await pool.execute(
      `INSERT INTO lobby_settings (
         lobby_id, password_hash, time_limit_seconds, scoring, allow_deal_extra, game_mode,
         deal_extra_size, deck_size, board_columns, initial_board_size
       ) VALUES (?, ${input.passwordHash === undefined ? "NULL" : "?"}, ?, 'streak', ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         time_limit_seconds = VALUES(time_limit_seconds),
         game_mode = VALUES(game_mode),
         allow_deal_extra = VALUES(allow_deal_extra),
         deal_extra_size = VALUES(deal_extra_size),
         deck_size = VALUES(deck_size),
         board_columns = VALUES(board_columns),
         initial_board_size = VALUES(initial_board_size)
         ${input.passwordHash === undefined ? "" : ", password_hash = VALUES(password_hash)"}`,
      input.passwordHash === undefined
        ? [
            lobbyId,
            input.timeLimitSeconds,
            input.dealExtraSize > 0 ? 1 : 0,
            input.gameMode,
            input.dealExtraSize,
            input.deckSize,
            input.boardColumns,
            input.initialBoardSize,
          ]
        : [
            lobbyId,
            input.passwordHash,
            input.timeLimitSeconds,
            input.dealExtraSize > 0 ? 1 : 0,
            input.gameMode,
            input.dealExtraSize,
            input.deckSize,
            input.boardColumns,
            input.initialBoardSize,
          ],
    );
  }

  async markInGame(lobbyId: string, gameId: string): Promise<void> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    await pool.execute(
      `UPDATE lobbies SET status = 'in_game', multiplayer_game_id = ? WHERE id = ?`,
      [gameId, lobbyId],
    );
  }
}

const LOBBY_SELECT = `SELECT l.id, l.host_user_id, l.status, l.max_players, l.invite_code,
  l.multiplayer_game_id, l.created_at,
  s.password_hash, s.time_limit_seconds, s.game_mode,
  s.deal_extra_size, s.deck_size, s.board_columns, s.initial_board_size
  FROM lobbies l
  LEFT JOIN lobby_settings s ON s.lobby_id = l.id`;

function mapLobby(row: LobbyDbRow): LobbyRow {
  return {
    id: row.id,
    hostUserId: row.host_user_id,
    status: row.status,
    maxPlayers: row.max_players,
    inviteCode: row.invite_code,
    multiplayerGameId: row.multiplayer_game_id,
    createdAt: new Date(row.created_at),
    passwordHash: row.password_hash,
    timeLimitSeconds: row.time_limit_seconds,
    gameMode: row.game_mode === "time_attack" ? "time_attack" : "classic",
    dealExtraSize: row.deal_extra_size,
    deckSize: row.deck_size,
    boardColumns: row.board_columns,
    initialBoardSize: row.initial_board_size,
  };
}
