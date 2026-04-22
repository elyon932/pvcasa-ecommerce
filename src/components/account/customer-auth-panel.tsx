"use client";

import { useState } from "react";
import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { CustomerRegisterForm } from "@/components/account/customer-register-form";

type CustomerAuthPanelProps = {
  callbackUrl?: string;
};

export function CustomerAuthPanel({ callbackUrl = "/account" }: CustomerAuthPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="space-y-5">
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`inline-flex min-h-12 w-full items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition ${
            mode === "login"
              ? "border-[color:var(--wood)] bg-[color:var(--wood)] text-white"
              : "border-[color:var(--border-strong)] bg-white text-[color:var(--wood-dark)] hover:border-[color:var(--copper)]"
          }`}
        >
          Entrar na conta
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`inline-flex min-h-12 w-full items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition ${
            mode === "register"
              ? "border-[color:var(--wood)] bg-[color:var(--wood)] text-white"
              : "border-[color:var(--border-strong)] bg-white text-[color:var(--wood-dark)] hover:border-[color:var(--copper)]"
          }`}
        >
          Cadastrar-se
        </button>
      </div>

      {mode === "login" ? (
        <CustomerLoginForm callbackUrl={callbackUrl} />
      ) : (
        <CustomerRegisterForm callbackUrl={callbackUrl} onSuccess={() => setMode("login")} />
      )}
    </div>
  );
}
