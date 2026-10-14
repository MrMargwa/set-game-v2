"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/shared/presentation/theme/theme-toggle";
import { btnPrimary, linkNav } from "@/shared/presentation/ui/styles";
import { LogoutButton } from "./logout-button";

type SiteHeaderNavProps = {
  username: string | null;
};

const links = [
  { href: "/play", label: "Spelen" },
  { href: "/rules", label: "Spelregels" },
  { href: "/leaderboards", label: "Leaderboard" },
] as const;

const accountLinks = [
  { href: "/lobby", label: "Lobby" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function desktopLinkClass(active: boolean): string {
  return `inline-flex min-h-11 items-center rounded-lg px-2.5 text-sm ${
    active ? "font-semibold text-foreground" : linkNav
  }`;
}

function mobileLinkClass(active: boolean): string {
  return `flex min-h-11 items-center rounded-lg px-3 text-base ${
    active
      ? "bg-accent-muted/60 font-semibold text-foreground"
      : "font-medium text-foreground hover:bg-surface-elevated"
  }`;
}

export function SiteHeaderNav({ username }: SiteHeaderNavProps) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-elevated/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-3 sm:px-4">
        <Link
          href="/"
          className="font-display truncate text-base font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          SET Game v2
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Hoofdmenu">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={desktopLinkClass(isCurrent(pathname, link.href))}
              aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          {username ? (
            <>
              {accountLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={desktopLinkClass(isCurrent(pathname, link.href))}
                  aria-current={
                    isCurrent(pathname, link.href) ? "page" : undefined
                  }
                >
                  {link.label}
                </Link>
              ))}
              <span className="max-w-32 truncate px-2 text-sm text-muted">
                {username}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={desktopLinkClass(isCurrent(pathname, "/login"))}>
                Inloggen
              </Link>
              <Link
                href="/register"
                className={`${btnPrimary} ml-1 !min-h-11 px-3 py-1.5`}
              >
                Registreren
              </Link>
            </>
          )}
          <ThemeToggle className="ml-1" />
        </nav>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          {open ? "Sluit" : "Menu"}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Hoofdmenu"
          className="max-h-[min(32rem,calc(100dvh-3.5rem-env(safe-area-inset-top)))] overflow-y-auto border-t border-border px-3 py-2 lg:hidden"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={mobileLinkClass(isCurrent(pathname, link.href))}
                aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            {username ? (
              <>
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={mobileLinkClass(isCurrent(pathname, link.href))}
                    aria-current={
                      isCurrent(pathname, link.href) ? "page" : undefined
                    }
                  >
                    {link.label}
                  </Link>
                ))}
                <p className="px-3 py-2 text-sm text-muted">
                  Ingelogd als{" "}
                  <span className="font-medium text-foreground">{username}</span>
                </p>
                <LogoutButton fullWidth />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={mobileLinkClass(isCurrent(pathname, "/login"))}
                >
                  Inloggen
                </Link>
                <Link href="/register" className={`${btnPrimary} mt-1 w-full`}>
                  Registreren
                </Link>
              </>
            )}
            <div className="mt-2 px-1 pb-1">
              <ThemeToggle className="w-full" />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
