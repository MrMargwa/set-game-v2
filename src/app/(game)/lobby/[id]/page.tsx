import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { ComingSoonPanel } from "@/modules/games/presentation/coming-soon-panel";
import { LobbyRoom } from "@/modules/lobbies/presentation/lobby-room";
import { isMultiplayerLobbyEnabled } from "@/shared/config/game-availability";

export const metadata: Metadata = { title: "Lobby" };

type LobbyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LobbyDetailPage({ params }: LobbyDetailPageProps) {
  if (!isMultiplayerLobbyEnabled()) {
    return <ComingSoonPanel feature="multiplayer" />;
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  return <LobbyRoom lobbyId={id} />;
}
