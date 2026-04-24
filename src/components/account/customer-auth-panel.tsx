"use client";

import { useState } from "react";
import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { CustomerRegisterForm } from "@/components/account/customer-register-form";

type CustomerAuthPanelProps = {
  callbackUrl?: string;
};

export function CustomerAuthPanel({ callbackUrl = "/account" }: CustomerAuthPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return mode === "login" ? (
    <CustomerLoginForm
      callbackUrl={callbackUrl}
      onSwitchToRegister={() => setMode("register")}
    />
  ) : (
    <CustomerRegisterForm
      callbackUrl={callbackUrl}
      onSuccess={() => setMode("login")}
      onSwitchToLogin={() => setMode("login")}
    />
  );
}
