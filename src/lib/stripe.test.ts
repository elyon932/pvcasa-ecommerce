import { beforeEach, describe, expect, it } from "vitest";
import { buildCheckoutUrls } from "@/lib/stripe";

describe("stripe URL helpers", () => {
  beforeEach(() => {
    delete process.env.STRIPE_CHECKOUT_BASE_URL;
    delete process.env.NEXTAUTH_URL;
    delete process.env.STRIPE_CHECKOUT_SUCCESS_URL;
    delete process.env.STRIPE_CHECKOUT_CANCEL_URL;
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
});
