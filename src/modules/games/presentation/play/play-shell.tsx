"use client";

import { useEffect, type ReactNode } from "react";

type PlayShellProps = {
  children: ReactNode;
};

export function PlayShell({ children }: PlayShellProps) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      data-play-shell
      className="fixed inset-x-0 top-[calc(3.5rem+1px)] bottom-0 z-30 overflow-hidden bg-background"
    >
      <div className="play-shell-grid mx-auto grid h-full min-h-0 w-full max-w-6xl gap-2 px-3 py-2 lg:px-4">
        {children}
      </div>
    </div>
  );
}

export function PlayShellLeft({ children }: { children: ReactNode }) {
  return (
    <aside className="play-chrome flex min-h-0 flex-col gap-2 overflow-y-auto lg:max-h-full lg:self-start">
      {children}
    </aside>
  );
}

export function PlayShellCenter({ children }: { children: ReactNode }) {
  return (
    <div className="play-board flex min-h-0 min-w-0 flex-col overflow-y-auto lg:overflow-hidden">
      {children}
    </div>
  );
}

export function PlayShellActions({ children }: { children: ReactNode }) {
  return (
    <div className="play-actions grid grid-cols-2 gap-2 [&>*:last-child:nth-child(odd)]:col-span-2 lg:flex lg:flex-col lg:self-end">
      {children}
    </div>
  );
}

export function PlayShellRight({ children }: { children: ReactNode }) {
  return (
    <aside className="play-ranks hidden min-h-0 flex-col overflow-hidden lg:flex lg:max-h-full">
      {children}
    </aside>
  );
}

/** Stand / leaderboard op mobiel onder het bord */
export function PlayShellRightMobile({ children }: { children: ReactNode }) {
  return (
    <aside className="max-h-36 shrink-0 overflow-y-auto rounded-lg border border-border bg-surface p-2 shadow-[var(--shadow-card)] lg:hidden">
      {children}
    </aside>
  );
}

export function PlayBoardFrame({
  children,
  celebrate,
  testId = "game-board",
}: {
  children: ReactNode;
  celebrate?: boolean;
  testId?: string;
}) {
  return (
    <div
      className={`play-board-frame relative flex shrink-0 flex-col rounded-xl border border-border bg-surface-elevated/60 px-2 py-2 shadow-[var(--shadow-card)] sm:rounded-2xl sm:px-3 lg:min-h-0 lg:flex-1 lg:shrink lg:overflow-hidden lg:[container-type:size] ${
        celebrate ? "animate-board-success" : ""
      }`}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

type PlayBoardGridProps = {
  boardRows: number;
  columns?: number;
  inactive?: boolean;
  dimmed?: boolean;
  children: ReactNode;
};

export function PlayBoardGrid({
  boardRows,
  columns,
  inactive,
  dimmed,
  children,
}: PlayBoardGridProps) {
  return (
    <div
      className={`play-board-grid mx-auto grid w-full content-start ${
        inactive ? "pointer-events-none select-none" : ""
      } ${dimmed ? "opacity-60 blur-sm" : ""}`}
      style={{
        ["--board-rows" as string]: boardRows,
        ...(columns ? { ["--board-cols" as string]: columns } : {}),
      }}
    >
      {children}
    </div>
  );
}
