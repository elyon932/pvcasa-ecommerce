"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--foreground)] hover:border-[color:var(--copper)]"
    >
      <LogOut className="size-4" />
      Sair
    </button>
  );
}
