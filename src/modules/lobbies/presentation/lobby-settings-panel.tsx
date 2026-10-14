"use client";

import { useState, type ReactNode } from "react";
import {
  CLASSIC_DEFAULT_SECONDS,
  formatLobbyTime,
  LOBBY_BOARDS,
  LOBBY_DEAL_EXTRA_SIZES,
  LOBBY_DECK_SIZES,
  LOBBY_MAX_MINUTES,
  LOBBY_MIN_MINUTES,
  TIME_ATTACK_DEFAULT_SECONDS,
  TIME_ATTACK_TIME_STEPS,
  type LobbyBoard,
  type LobbyDealExtraSize,
  type LobbyDeckSize,
  type LobbyMatchSettings,
  type LobbyMode,
} from "../domain/lobby-settings";
import { btnPrimary, btnSecondary, inputField, panel } from "@/shared/presentation/ui/styles";

type SettingsDraft = {
  maxPlayers: 2 | 3 | 4;
  mode: LobbyMode;
  seconds: number;
  dealExtraSize: LobbyDealExtraSize;
  deckSize: LobbyDeckSize;
  board: LobbyBoard;
  password: string;
  clearPassword: boolean;
};

type LobbySettingsPanelProps = {
  lobbyId: string;
  settings: LobbyMatchSettings;
  isHost: boolean;
  locked: boolean;
  onSaved: () => void;
  onError: (message: string) => void;
};

const choice =
  "min-h-10 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-surface-elevated";
const choiceOn = "min-h-10 rounded-lg bg-accent px-3 text-sm font-medium text-accent-foreground";

export function LobbySettingsPanel({
  lobbyId,
  settings,
  isHost,
  locked,
  onSaved,
  onError,
}: LobbySettingsPanelProps) {
  const [draft, setDraft] = useState<SettingsDraft>(() => toDraft(settings));
  const [saving, setSaving] = useState(false);

  if (!isHost) {
    return (
      <section className={`${panel} rounded-2xl p-5`}>
        <h2 className="font-display text-lg font-semibold">Spelregels</h2>
        <p className="mt-3 text-sm text-muted">{summaryLine(settings)}</p>
        <p className="mt-2 text-sm text-muted">{modeBlurb(settings.mode)}</p>
      </section>
    );
  }

  async function save() {
    setSaving(true);
    onError("");
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxPlayers: draft.maxPlayers,
          mode: draft.mode,
          timeLimitSeconds: draft.seconds,
          dealExtraSize: draft.dealExtraSize,
          deckSize: draft.deckSize,
          boardColumns: draft.board.columns,
          initialBoardSize: draft.board.cards,
          password: draft.clearPassword ? null : draft.password.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        onError(data.error ?? "Instellingen opslaan is niet gelukt.");
        return;
      }
      setDraft((current) => ({ ...current, password: "", clearPassword: false }));
      onSaved();
    } catch {
      onError("Geen verbinding. Probeer het opnieuw.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`${panel} rounded-2xl p-5`}>
      <h2 className="font-display text-lg font-semibold">Instellingen</h2>
      <p className="mt-1 text-sm text-muted">
        Alleen jij als host kunt dit wijzigen, tot het spel start.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <Setting label="Spelers">
          {([2, 3, 4] as const).map((count) => (
            <button
              key={count}
              type="button"
              disabled={locked}
              className={draft.maxPlayers === count ? choiceOn : choice}
              onClick={() => setDraft((current) => ({ ...current, maxPlayers: count }))}
            >
              {count}
            </button>
          ))}
        </Setting>

        <Setting label="Mode">
          <button
            type="button"
            disabled={locked}
            className={draft.mode === "classic" ? choiceOn : choice}
            onClick={() =>
              setDraft((current) => ({
                ...current,
                mode: "classic",
                seconds: CLASSIC_DEFAULT_SECONDS,
              }))
            }
          >
            Classic
          </button>
          <button
            type="button"
            disabled={locked}
            className={draft.mode === "time_attack" ? choiceOn : choice}
            onClick={() =>
              setDraft((current) => ({
                ...current,
                mode: "time_attack",
                seconds: TIME_ATTACK_DEFAULT_SECONDS,
              }))
            }
          >
            Time Attack
          </button>
        </Setting>
        <p className="-mt-2 text-sm text-muted">{modeBlurb(draft.mode)}</p>

        {draft.mode === "time_attack" ? (
          <Setting label="Tijd">
            {TIME_ATTACK_TIME_STEPS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                disabled={locked}
                className={draft.seconds === seconds ? choiceOn : choice}
                onClick={() => setDraft((current) => ({ ...current, seconds }))}
              >
                {formatLobbyTime(seconds)}
              </button>
            ))}
          </Setting>
        ) : (
          <label className="text-sm font-medium text-foreground">
            Tijd · {formatLobbyTime(draft.seconds)}
            <input
              type="range"
              min={LOBBY_MIN_MINUTES}
              max={LOBBY_MAX_MINUTES}
              step={1}
              value={draft.seconds / 60}
              disabled={locked}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  seconds: Number(event.target.value) * 60,
                }))
              }
              className="mt-2 w-full accent-accent"
            />
            <span className="mt-1 flex justify-between text-xs font-normal text-muted">
              <span>1 min</span>
              <span>60 min</span>
            </span>
          </label>
        )}

        <Setting label="Extra kaarten">
          {LOBBY_DEAL_EXTRA_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              disabled={locked}
              className={draft.dealExtraSize === size ? choiceOn : choice}
              onClick={() => setDraft((current) => ({ ...current, dealExtraSize: size }))}
            >
              {size === 0 ? "Uit" : `+${size}`}
            </button>
          ))}
        </Setting>

        <Setting label="Deck">
          {LOBBY_DECK_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              disabled={locked || draft.board.cards > size}
              className={draft.deckSize === size ? choiceOn : choice}
              onClick={() => setDraft((current) => ({ ...current, deckSize: size }))}
            >
              {size}
            </button>
          ))}
        </Setting>
        <p className="-mt-2 text-sm text-muted">
          27 is een korte ronde, 81 is het volledige SET-deck.
        </p>

        <Setting label="Bord">
          {LOBBY_BOARDS.map((board) => (
            <button
              key={board.label}
              type="button"
              disabled={locked || board.cards > draft.deckSize}
              className={
                draft.board.columns === board.columns && draft.board.cards === board.cards
                  ? choiceOn
                  : choice
              }
              onClick={() => setDraft((current) => ({ ...current, board }))}
            >
              {board.label}
            </button>
          ))}
        </Setting>

        <label className="text-sm font-medium text-foreground">
          Wachtwoord
          <input
            type="password"
            value={draft.password}
            disabled={locked}
            autoComplete="new-password"
            placeholder={settings.hasPassword ? "Nieuw wachtwoord" : "Geen wachtwoord"}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                password: event.target.value,
                clearPassword: false,
              }))
            }
            className={inputField}
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            {settings.hasPassword
              ? "De lobby is beveiligd. Laat leeg om het wachtwoord te houden."
              : "Leeg laten betekent: iedereen met de code kan joinen."}
          </span>
        </label>
        {settings.hasPassword ? (
          <button
            type="button"
            disabled={locked}
            className={`${btnSecondary} w-full sm:w-auto`}
            onClick={() =>
              setDraft((current) => ({ ...current, password: "", clearPassword: true }))
            }
          >
            {draft.clearPassword ? "Wachtwoord wordt gewist" : "Wachtwoord wissen"}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        disabled={locked || saving}
        onClick={() => void save()}
        className={`${btnPrimary} mt-5 w-full sm:w-auto`}
      >
        Instellingen opslaan
      </button>
    </section>
  );
}

function Setting({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function toDraft(settings: LobbyMatchSettings): SettingsDraft {
  return {
    maxPlayers: settings.maxPlayers,
    mode: settings.mode,
    seconds: settings.timeLimitSeconds,
    dealExtraSize: settings.dealExtraSize,
    deckSize: settings.deckSize,
    board:
      LOBBY_BOARDS.find(
        (board) =>
          board.columns === settings.boardColumns && board.cards === settings.initialBoardSize,
      ) ?? LOBBY_BOARDS[1],
    password: "",
    clearPassword: false,
  };
}

function modeBlurb(mode: LobbyMode): string {
  if (mode === "time_attack") {
    return "Wie binnen de tijd de meeste SETs vindt, wint.";
  }
  return "Wie de hoogste score haalt, wint. Streaks tellen mee. Hoe later in de ronde, hoe minder een SET waard is — aan het eind nog zo’n 40%.";
}

function summaryLine(settings: LobbyMatchSettings): string {
  const mode = settings.mode === "time_attack" ? "Time Attack" : "Classic";
  const lock = settings.hasPassword ? "met wachtwoord" : "zonder wachtwoord";
  const extra = settings.dealExtraSize === 0 ? "geen extra kaarten" : `+${settings.dealExtraSize} kaarten`;
  const board =
    LOBBY_BOARDS.find(
      (item) => item.columns === settings.boardColumns && item.cards === settings.initialBoardSize,
    )?.label ?? "5×3";
  return `${mode} · ${formatLobbyTime(settings.timeLimitSeconds)} · ${settings.maxPlayers} spelers · deck ${settings.deckSize} · bord ${board} · ${extra} · ${lock}`;
}
