"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnSecondary } from "@/shared/presentation/ui/styles";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`${btnSecondary} !min-h-0 px-3 py-1.5`}
    >
      {loading ? "…" : "Uitloggen"}
    </button>
  );
}
