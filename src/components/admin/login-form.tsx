"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
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
          const response = await signIn("admin-credentials", {
            redirect: false,
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            callbackUrl: "/admin",
          });

          if (response?.error) {
            setError("Credenciais inválidas. Revise o e-mail e a senha.");
            return;
          }

          window.location.href = "/admin";
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-[color:var(--wood-dark)]" htmlFor="email">
          E-mail administrativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue="admin@pvcasa.com.br"
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-[color:var(--wood-dark)]"
          htmlFor="password"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          defaultValue="admin123"
          className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--copper)]"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--wood-dark)] disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar no painel"}
      </button>
      <p className="text-xs leading-6 text-[color:var(--muted-foreground)]">
        Em produção, mova as credenciais para variáveis de ambiente e troque a senha padrão.
      </p>
    </form>
  );
}
