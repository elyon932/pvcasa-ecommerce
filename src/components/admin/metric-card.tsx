export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-5 shadow-[0_12px_30px_rgba(60,38,22,0.06)] sm:rounded-[1.75rem] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-4 text-[clamp(1.8rem,3.6vw,2.2rem)] font-semibold leading-none text-[color:var(--wood-dark)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">{helper}</p>
    </div>
  );
}
