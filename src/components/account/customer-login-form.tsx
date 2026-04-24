"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

type CustomerLoginFormProps = {
  callbackUrl?: string;
  onSwitchToRegister?: () => void;
};

export function CustomerLoginForm({
  callbackUrl = "/account",
  onSwitchToRegister,
}: CustomerLoginFormProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          setError("");
          const response = await signIn("customer-credentials", {
            redirect: false,
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            callbackUrl,
          });

          if (response?.error) {
            setError("Não foi possível entrar. Confira seus dados.");
            return;
          }

          window.location.href = response?.url ?? callbackUrl;
        });
      }}
    >
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-[color:var(--wood-dark)]">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="ana@pvcasa.com"
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-[color:var(--wood-dark)]">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          defaultValue="cliente123"
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--wood-dark)] disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar na conta"}
      </button>
      {onSwitchToRegister ? (
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--wood-dark)] transition hover:border-[color:var(--copper)] hover:text-[color:var(--copper)]"
        >
          Cadastrar-se
        </button>
      ) : null}
    </form>
  );
}
