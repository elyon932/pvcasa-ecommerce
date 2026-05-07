"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const sessionKey = "pvcasa_traffic_session_id";
const trackedKey = "pvcasa_traffic_tracked";

function getSessionId() {
  const existing = window.sessionStorage.getItem(sessionKey);

  if (existing) {
    return existing;
  }

  const generated =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.sessionStorage.setItem(sessionKey, generated);
  return generated;
}

export function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    if (window.sessionStorage.getItem(trackedKey)) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const queryString = searchParams.toString();
    const payload = {
      path: `${pathname}${queryString ? `?${queryString}` : ""}`,
      referrer: document.referrer || undefined,
      utmSource: searchParams.get("utm_source") ?? undefined,
      utmMedium: searchParams.get("utm_medium") ?? undefined,
      utmCampaign: searchParams.get("utm_campaign") ?? undefined,
      sessionId: getSessionId(),
    };

    window.sessionStorage.setItem(trackedKey, "1");

    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/traffic", new Blob([body], { type: "application/json" }));
      return;
    }

    void fetch("/api/analytics/traffic", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  }, [pathname]);

  return null;
}
