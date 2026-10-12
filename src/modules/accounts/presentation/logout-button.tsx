"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnSecondary } from "@/shared/presentation/ui/styles";

type LogoutButtonProps = {
  fullWidth?: boolean;
};

export function LogoutButton({ fullWidth = false }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError("Uitloggen is niet gelukt. Probeer het opnieuw.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Uitloggen is niet gelukt. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span
      className={
        fullWidth
          ? "flex w-full flex-col gap-1"
          : "inline-flex items-center gap-2"
      }
    >
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className={
          fullWidth
            ? `${btnSecondary} w-full`
            : `${btnSecondary} !min-h-11 px-3 py-1.5`
        }
      >
        {loading ? "Bezig…" : "Uitloggen"}
      </button>
      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </span>
  );
}
