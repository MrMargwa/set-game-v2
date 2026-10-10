import type { RowDataPacket } from "mysql2";
import { getPool } from "@/infrastructure/database/client";
import type { UserId } from "@/modules/accounts/domain/user";

export type LobbyStatus = "open" | "in_game" | "closed";

export type LobbyRow = {
  id: string;
  hostUserId: UserId;
  status: LobbyStatus;
  maxPlayers: number;
  inviteCode: string;
  multiplayerGameId: string | null;
  createdAt: Date;
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

    return {
      id,
      hostUserId,
      status: "open",
      maxPlayers: 4,
      inviteCode,
      multiplayerGameId: null,
      createdAt: now,
    };
  }

  async findById(lobbyId: string): Promise<LobbyRow | null> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const [rows] = await pool.execute<LobbyDbRow[]>(
      `SELECT id, host_user_id, status, max_players, invite_code, multiplayer_game_id, created_at
       FROM lobbies WHERE id = ? LIMIT 1`,
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
      `SELECT id, host_user_id, status, max_players, invite_code, multiplayer_game_id, created_at
       FROM lobbies WHERE invite_code = ? LIMIT 1`,
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

  async markInGame(lobbyId: string, gameId: string): Promise<void> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    await pool.execute(
      `UPDATE lobbies SET status = 'in_game', multiplayer_game_id = ? WHERE id = ?`,
      [gameId, lobbyId],
    );
  }
}

function mapLobby(row: LobbyDbRow): LobbyRow {
  return {
    id: row.id,
    hostUserId: row.host_user_id,
    status: row.status,
    maxPlayers: row.max_players,
    inviteCode: row.invite_code,
    multiplayerGameId: row.multiplayer_game_id,
    createdAt: new Date(row.created_at),
  };
}
