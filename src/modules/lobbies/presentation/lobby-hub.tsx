"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  alertDanger,
  btnPrimary,
  btnSecondary,
  inputField,
  pageLead,
  pageTitle,
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
      const data = (await res.json()) as { lobby?: { id: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Kon lobby niet aanmaken.");
        return;
      }
      if (data.lobby?.id) {
        router.push(`/lobby/${data.lobby.id}`);
      }
    } catch {
      setError("Netwerkfout. Probeer opnieuw.");
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
      const data = (await res.json()) as { lobby?: { id: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Kon niet joinen.");
        return;
      }
      if (data.lobby?.id) {
        router.push(`/lobby/${data.lobby.id}`);
      }
    } catch {
      setError("Netwerkfout. Probeer opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-10">
      <header>
        <h1 className={pageTitle}>Online lobby</h1>
        <p className={pageLead}>
          Maak een lobby aan of join met een invitecode. Minimaal twee spelers
          voor een realtime Classic-race.
        </p>
      </header>

      {error && (
        <p className={alertDanger} role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={createLobby}
        className={btnPrimary}
      >
        Nieuwe lobby
      </button>

      <form onSubmit={joinLobby} className="flex flex-col gap-3">
        <label className="text-sm font-medium text-foreground">
          Invitecode
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className={`${inputField} font-mono uppercase tracking-widest`}
            placeholder="ABC123"
            maxLength={8}
            autoComplete="off"
          />
        </label>
        <button
          type="submit"
          disabled={busy || inviteCode.trim().length < 4}
          className={btnSecondary}
        >
          Lobby joinen
        </button>
      </form>
    </div>
  );
}
