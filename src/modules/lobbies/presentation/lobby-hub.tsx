"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconModeMultiplayer } from "@/shared/presentation/ui/mode-icons";
import {
  alertDanger,
  btnPrimary,
  btnSecondary,
  inputField,
  pageLead,
  pageTitle,
  panel,
} from "@/shared/presentation/ui/styles";

export function LobbyHub() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createLobby() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/lobbies", { method: "POST" });
      const data = (await res.json()) as {
        lobby?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "De lobby kon niet worden aangemaakt.");
        return;
      }
      if (data.lobby?.id) {
        router.push(`/lobby/${data.lobby.id}`);
      }
    } catch {
      setError("Geen verbinding. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  async function joinLobby(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/lobbies/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = (await res.json()) as {
        lobby?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Meedoen is niet gelukt. Controleer de code.");
        return;
      }
      if (data.lobby?.id) {
        router.push(`/lobby/${data.lobby.id}`);
      }
    } catch {
      setError("Geen verbinding. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:py-10">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Multiplayer
        </p>
        <h1 className={`${pageTitle} mt-2 text-3xl sm:text-4xl`}>
          Online lobby
        </h1>
        <p className={`${pageLead} text-base`}>
          Start een kamer voor vrienden of voer een invitecode in. Minimaal twee
          spelers om samen SET te spelen.
        </p>
      </header>

      {error && (
        <p className={alertDanger} role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <article
          className={`${panel} flex flex-col rounded-2xl p-5 shadow-[var(--shadow-card)] sm:p-6`}
        >
          <div className="flex items-start gap-4">
            <div
              className="grid size-[4.25rem] shrink-0 place-items-center rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-muted/70 to-surface text-accent"
              aria-hidden
            >
              <IconModeMultiplayer className="size-8" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Nieuwe lobby</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Jij bent host. Deel de code met vrienden en start wanneer iedereen
                er is.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={createLobby}
            className={`${btnPrimary} mt-6 w-full sm:w-auto`}
          >
            Lobby aanmaken
          </button>
        </article>

        <article
          className={`${panel} flex flex-col rounded-2xl p-5 shadow-[var(--shadow-card)] sm:p-6`}
        >
          <h2 className="font-display text-xl font-semibold">Code invoeren</h2>
          <p className="mt-2 text-sm text-muted">
            Heb je een invitecode? Voer die hier in.
          </p>
          <form onSubmit={joinLobby} className="mt-5 flex flex-1 flex-col gap-3">
            <label className="text-sm font-medium text-foreground">
              Invitecode
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className={`${inputField} font-mono text-lg uppercase tracking-[0.2em]`}
                placeholder="ABC123"
                maxLength={8}
                autoComplete="off"
              />
              <span className="mt-1 block text-xs font-normal text-muted">
                4 tot 8 tekens, hoofdletters.
              </span>
            </label>
            <button
              type="submit"
              disabled={busy || inviteCode.trim().length < 4}
              className={`${btnSecondary} w-full sm:w-auto`}
            >
              Meedoen
            </button>
          </form>
        </article>
      </div>

      <p className="text-center text-sm text-muted">
        Liever solo?{" "}
        <Link
          href="/play?mode=classic"
          className="font-medium text-accent hover:text-accent-hover"
        >
          Speel Classic
        </Link>
      </p>
    </div>
  );
}
