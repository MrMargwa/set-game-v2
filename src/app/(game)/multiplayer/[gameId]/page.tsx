import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { ComingSoonPanel } from "@/modules/games/presentation/coming-soon-panel";
import { MultiplayerGameBoard } from "@/modules/multiplayer/presentation/multiplayer-game-board";
import { isMultiplayerLobbyEnabled } from "@/shared/config/game-availability";

export const metadata: Metadata = { title: "Multiplayer" };

type MultiplayerPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function MultiplayerPage({ params }: MultiplayerPageProps) {
  if (!isMultiplayerLobbyEnabled()) {
    return <ComingSoonPanel feature="multiplayer" />;
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const { gameId } = await params;
  return <MultiplayerGameBoard gameId={gameId} currentUserId={user.id} />;
}
