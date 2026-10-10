import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { LobbyHub } from "@/modules/lobbies/presentation/lobby-hub";

export default async function LobbyPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  return <LobbyHub />;
}
