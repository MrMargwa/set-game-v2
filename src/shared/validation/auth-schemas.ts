import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Gebruikersnaam moet minimaal 3 tekens zijn")
    .max(32)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Alleen letters, cijfers en underscore",
    ),
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens zijn")
    .max(128),
  email: z
    .string()
    .trim()
    .email("Ongeldig e-mailadres")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Gebruikersnaam is verplicht"),
  password: z.string().min(1, "Wachtwoord is verplicht"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
