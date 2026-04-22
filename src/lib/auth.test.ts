import { describe, expect, it } from "vitest";
import {
  authorizeAdminCredentials,
  authorizeCustomerCredentials,
} from "@/lib/auth";

describe("auth helpers", () => {
  it("authorizes the admin with the default development credentials", async () => {
    const admin = await authorizeAdminCredentials("admin@pvcasa.com.br", "admin123");

    expect(admin).toMatchObject({
      role: "admin",
      email: "admin@pvcasa.com.br",
    });
  });

  it("rejects invalid admin credentials", async () => {
    const admin = await authorizeAdminCredentials("admin@pvcasa.com.br", "wrong-password");
    expect(admin).toBeNull();
  });

  it("authorizes a mock customer account", async () => {
    const customer = await authorizeCustomerCredentials("ana@pvcasa.com", "cliente123");

    expect(customer).toMatchObject({
      role: "customer",
      customerId: "customer-ana",
    });
  });

  it("rejects an unknown customer account", async () => {
    const customer = await authorizeCustomerCredentials("inexistente@pvcasa.com", "cliente123");
    expect(customer).toBeNull();
  });
});
