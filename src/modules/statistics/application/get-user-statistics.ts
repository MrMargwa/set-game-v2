import type { UserId } from "@/modules/accounts/domain/user";
import type { UserStatistics } from "../domain/types";
import { UserStatisticsRepository } from "../infrastructure/user-statistics-repository";

const repository = new UserStatisticsRepository();

export async function getUserStatistics(
  userId: UserId,
): Promise<
  { ok: true; data: UserStatistics } | { ok: false; message: string }
> {
  try {
    const data = await repository.getForUser(userId);
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      message: "Statistieken zijn tijdelijk niet beschikbaar. Probeer het later opnieuw.",
    };
  }
}
