import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { MultiplayerGameBoard } from "@/modules/multiplayer/presentation/multiplayer-game-board";

type MultiplayerPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function MultiplayerPage({ params }: MultiplayerPageProps) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const { gameId } = await params;
  return <MultiplayerGameBoard gameId={gameId} currentUserId={user.id} />;
}
