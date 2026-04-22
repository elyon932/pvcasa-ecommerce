import { describe, expect, it } from "vitest";
import {
  formatBrazilPhone,
  formatPostalCode,
  registerCustomerSchema,
} from "@/lib/customer-validation";

describe("customer validation", () => {
  it("formats phone numbers into the expected storefront mask", () => {
    expect(formatBrazilPhone("93991112233")).toBe("(93) 99111-2233");
  });

  it("formats CEP values into the expected mask", () => {
    expect(formatPostalCode("68180220")).toBe("68180-220");
  });

  it("accepts valid customer registration data", () => {
    const parsed = registerCustomerSchema.safeParse({
      name: "Maria Silva",
      email: "maria@exemplo.com",
      phone: "(93) 99111-2233",
      password: "segura123",
      postalCode: "68180-220",
      street: "Rua das Flores",
      number: "125",
      neighborhood: "Centro",
      city: "Itaituba",
      state: "PA",
      complement: "Casa",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects registration data with malformed name and phone", () => {
    const parsed = registerCustomerSchema.safeParse({
      name: "Maria123",
      email: "maria@exemplo.com",
      phone: "93991112233",
      password: "segura123",
      postalCode: "68180-220",
      street: "Rua das Flores",
      number: "125",
      neighborhood: "Centro",
      city: "Itaituba",
      state: "PA",
      complement: "",
    });

    expect(parsed.success).toBe(false);
  });
});
