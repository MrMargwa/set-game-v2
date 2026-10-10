import Link from "next/link";
import { ThemeToggle } from "@/shared/presentation/theme/theme-toggle";
import { btnPrimary, linkNav } from "@/shared/presentation/ui/styles";
import { getAuthenticatedUser } from "../application/get-authenticated-user";
import { LogoutButton } from "./logout-button";

export async function SiteHeader() {
  const user = await getAuthenticatedUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-elevated/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
        <Link
          href="/"
          className="font-display text-base font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          SET Game v2
        </Link>
        <nav className="flex flex-wrap items-center gap-3">
          <Link href="/play" className={linkNav}>
            Spelen
          </Link>
          <Link href="/leaderboards" className={linkNav}>
            Leaderboard
          </Link>
          {user ? (
            <>
              <Link href="/lobby" className={linkNav}>
                Lobby
              </Link>
              <Link href="/dashboard" className={linkNav}>
                Dashboard
              </Link>
              <span className="text-muted">{user.username}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={linkNav}>
                Inloggen
              </Link>
              <Link href="/register" className={`${btnPrimary} !min-h-0 px-3 py-1.5`}>
                Registreren
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
