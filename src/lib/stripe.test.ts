import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildCheckoutUrls } from "@/lib/stripe";

describe("stripe URL helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.STRIPE_CHECKOUT_BASE_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.STRIPE_CHECKOUT_SUCCESS_URL;
    delete process.env.STRIPE_CHECKOUT_CANCEL_URL;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps checkout redirects on the configured origin", () => {
    const urls = buildCheckoutUrls({
      orderNumber: "PVC-20260428-001",
      requestOrigin: "https://pvcasa.example",
      cancelPath: "/products/jogo-cama",
    });

    expect(urls.successUrl).toBe(
      "https://pvcasa.example/checkout/success?order=PVC-20260428-001",
    );
    expect(urls.cancelUrl).toBe("https://pvcasa.example/products/jogo-cama");
  });

  it("falls back when cancelPath is protocol-relative", () => {
    const urls = buildCheckoutUrls({
      orderNumber: "PVC-20260428-001",
      requestOrigin: "https://pvcasa.example",
      cancelPath: "//evil.example/phishing",
    });

    expect(urls.cancelUrl).toBe("https://pvcasa.example/checkout");
  });

  it("uses the current request origin in development when local env URLs are stale", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.STRIPE_CHECKOUT_BASE_URL = "http://localhost:3000";
    process.env.STRIPE_CHECKOUT_SUCCESS_URL = "http://localhost:3000/checkout/success";
    process.env.STRIPE_CHECKOUT_CANCEL_URL = "http://localhost:3000/checkout";

    const urls = buildCheckoutUrls({
      orderNumber: "PVC-20260428-001",
      requestOrigin: "http://localhost",
      cancelPath: "/checkout",
    });

    expect(urls.successUrl).toBe("http://localhost/checkout/success?order=PVC-20260428-001");
    expect(urls.cancelUrl).toBe("http://localhost/checkout");
  });

  it("requires a configured checkout base URL in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() =>
      buildCheckoutUrls({
        orderNumber: "PVC-20260428-001",
        requestOrigin: "https://pvcasa.example",
        cancelPath: "/checkout",
      }),
    ).toThrow("CHECKOUT_BASE_URL_NOT_CONFIGURED");
  });
});
