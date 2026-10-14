import { z } from "zod";

export const joinLobbySchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(4, "Voer een geldige invitecode in.")
    .max(8, "Invitecode mag maximaal 8 tekens zijn."),
  password: z.string().max(32).optional(),
});

export const lobbySettingsSchema = z.object({
  maxPlayers: z.number().int().min(2).max(4),
  mode: z.enum(["classic", "time_attack"]),
  timeLimitSeconds: z.number().int().min(10).max(3600),
  dealExtraSize: z.number().int().min(0).max(5),
  deckSize: z.number().int().min(27).max(81),
  boardColumns: z.number().int().min(3).max(6),
  initialBoardSize: z.number().int().min(9).max(18),
  password: z.string().max(32).nullable().optional(),
});

export const multiplayerActionSchema = z.object({
  version: z.number().int().min(0),
  action: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("SUBMIT_SET"),
      cardIds: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
    }),
    z.object({ type: z.literal("DEAL_EXTRA") }),
  ]),
});
