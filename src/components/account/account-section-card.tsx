import type { ReactNode } from "react";

type AccountSectionCardProps = {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function AccountSectionCard({
  eyebrow,
  title,
  action,
  children,
}: AccountSectionCardProps) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--copper)]">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-lg font-semibold text-[color:var(--wood-dark)]">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
