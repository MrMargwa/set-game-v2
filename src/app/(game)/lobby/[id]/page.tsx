import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { LobbyRoom } from "@/modules/lobbies/presentation/lobby-room";

type LobbyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LobbyDetailPage({ params }: LobbyDetailPageProps) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  return <LobbyRoom lobbyId={id} />;
}
