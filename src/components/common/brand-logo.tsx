import Image from "next/image";
import Link from "next/link";
import { storeSettings } from "@/config/store";
import { cn } from "@/lib/utils";

export function BrandLogo({
  compact = false,
  inverted = false,
  className,
}: {
  compact?: boolean;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("flex min-w-0 items-center gap-2.5 sm:gap-3", className)}>
      <Image
        src="/brand/logo-primary.png"
        alt="PV Casa"
        width={48}
        height={48}
        className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
        priority
      />
      {!compact ? (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-serif text-[1.35rem] leading-none sm:text-2xl",
              inverted ? "text-white" : "text-[color:var(--wood-dark)]",
            )}
          >
            {storeSettings.name}
          </p>
          <p
            className={cn(
              "truncate text-[10px] uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]",
              inverted
                ? "text-[color:rgba(255,255,255,0.72)]"
                : "text-[color:var(--muted-foreground)]",
            )}
          >
            {storeSettings.slogan}
          </p>
        </div>
      ) : null}
    </Link>
  );
}
