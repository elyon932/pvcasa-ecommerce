import type { ReactNode } from "react";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";

export function StorefrontShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
