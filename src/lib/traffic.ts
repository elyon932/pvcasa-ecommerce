import "server-only";

const trafficSourceLabels = [
  "Busca orgânica",
  "Instagram",
  "Whatsapp",
  "Facebook",
  "Outros",
] as const;

export type TrafficSourceLabel = (typeof trafficSourceLabels)[number];

export const TRAFFIC_SOURCE_LABELS: readonly TrafficSourceLabel[] = trafficSourceLabels;

function normalizeInput(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function hostnameFromUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function resolveTrafficSource({
  referrer,
  utmSource,
  utmMedium,
}: {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
}): TrafficSourceLabel {
  const source = normalizeInput(utmSource);
  const medium = normalizeInput(utmMedium);
  const host = hostnameFromUrl(referrer);
  const lookup = `${source} ${medium} ${host}`;

  if (lookup.includes("instagram") || lookup.includes("ig")) {
    return "Instagram";
  }

  if (lookup.includes("whatsapp") || lookup.includes("wa.me")) {
    return "Whatsapp";
  }

  if (lookup.includes("facebook") || lookup.includes("fb.com")) {
    return "Facebook";
  }

  if (
    lookup.includes("google") ||
    lookup.includes("bing") ||
    lookup.includes("yahoo") ||
    lookup.includes("duckduckgo") ||
    lookup.includes("organic") ||
    lookup.includes("organico") ||
    lookup.includes("orgânico")
  ) {
    return "Busca orgânica";
  }

  return "Outros";
}
