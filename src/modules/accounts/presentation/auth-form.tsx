"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  alertDanger,
  btnPrimary,
  inputField,
  linkAccent,
  panel,
} from "@/shared/presentation/ui/styles";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload =
        mode === "register"
          ? { username, password, email: email || undefined }
          : { username, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { error?: string } = {};
      try {
        data = (await response.json()) as { error?: string };
      } catch {
        setError(
          response.ok
            ? "Onverwacht serverantwoord"
            : `Serverfout (${response.status})`,
        );
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Er ging iets mis");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Netwerkfout — probeer opnieuw");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${panel} mx-auto flex w-full max-w-sm flex-col gap-4 p-6`}
    >
      <h1 className="font-display text-xl font-semibold">
        {mode === "login" ? "Inloggen" : "Account aanmaken"}
      </h1>

      {error && (
        <p className={alertDanger} role="alert">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Gebruikersnaam
        <input
          className={inputField}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </label>

      {mode === "register" && (
        <label className="flex flex-col gap-1 text-sm">
          E-mail (optioneel)
          <input
            type="email"
            className={inputField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Wachtwoord
        <input
          type="password"
          className={inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
      </label>

      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? "Even geduld…" : mode === "login" ? "Inloggen" : "Registreren"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Nog geen account?{" "}
            <Link href="/register" className={linkAccent}>
              Registreren
            </Link>
          </>
        ) : (
          <>
            Al een account?{" "}
            <Link href="/login" className={linkAccent}>
              Inloggen
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
