import { z } from "zod";

export const joinLobbySchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(4, "Voer een geldige invitecode in.")
    .max(8, "Invitecode mag maximaal 8 tekens zijn."),
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
