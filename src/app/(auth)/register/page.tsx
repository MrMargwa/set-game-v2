import { AuthForm } from "@/modules/accounts/presentation/auth-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <AuthForm mode="register" />
    </div>
  );
}
