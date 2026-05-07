"use client";

import { LogOut } from "lucide-react";

export function SignOutButton({
  callbackUrl = "/account/login",
  scope = "customer",
}: {
  callbackUrl?: string;
  scope?: "admin" | "customer";
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/signout-scope", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ scope }),
        });
        window.location.replace(callbackUrl);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--foreground)] hover:border-[color:var(--copper)]"
    >
      <LogOut className="size-4" />
      Sair
    </button>
  );
}
