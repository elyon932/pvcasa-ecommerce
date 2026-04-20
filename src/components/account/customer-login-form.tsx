"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

export function CustomerLoginForm() {
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
            callbackUrl: "/account",
          });

          if (response?.error) {
            setError("Não foi possível entrar. Confira seus dados.");
            return;
          }

          window.location.href = "/account";
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
        className="w-full rounded-full bg-[color:var(--wood)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--wood-dark)] disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar na conta"}
      </button>
    </form>
  );
}
