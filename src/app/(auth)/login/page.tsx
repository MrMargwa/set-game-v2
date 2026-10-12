import type { Metadata } from "next";
import { AuthForm } from "@/modules/accounts/presentation/auth-form";

export const metadata: Metadata = { title: "Inloggen" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-start justify-center px-4 py-8 pb-[max(2rem,30dvh)] sm:items-center sm:py-12 sm:pb-12">
      <AuthForm mode="login" />
    </div>
  );
}
