import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_SESSION_COOKIE, CLIENT_SESSION_COOKIE } from "@/lib/auth-cookies";
import {
  ADMIN_SESSION_MAX_AGE,
  adminAuthOptions,
  authorizeAdminCredentials,
  authorizeCustomerCredentials,
  CLIENT_SESSION_MAX_AGE,
  clientAuthOptions,
} from "@/lib/auth";

describe("auth helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
  });

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

  it("blocks fallback admin credentials outside development", async () => {
    vi.stubEnv("NODE_ENV", "test");

    const admin = await authorizeAdminCredentials("admin@pvcasa.com.br", "admin123");

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

  it("uses separate session cookies for customer and admin auth", () => {
    expect(clientAuthOptions.cookies?.sessionToken?.name).toBe(CLIENT_SESSION_COOKIE);
    expect(adminAuthOptions.cookies?.sessionToken?.name).toBe(ADMIN_SESSION_COOKIE);
    expect(clientAuthOptions.cookies?.sessionToken?.name).not.toBe(
      adminAuthOptions.cookies?.sessionToken?.name,
    );
    expect(clientAuthOptions.session?.maxAge).toBe(CLIENT_SESSION_MAX_AGE);
    expect(adminAuthOptions.session?.maxAge).toBe(ADMIN_SESSION_MAX_AGE);
    expect(adminAuthOptions.session?.updateAge).toBe(60 * 60);
  });

  it("builds customer and admin sessions from isolated tokens", async () => {
    const clientJwt = clientAuthOptions.callbacks?.jwt;
    const clientSession = clientAuthOptions.callbacks?.session;
    const adminJwt = adminAuthOptions.callbacks?.jwt;
    const adminSession = adminAuthOptions.callbacks?.session;

    expect(clientJwt).toBeTypeOf("function");
    expect(clientSession).toBeTypeOf("function");
    expect(adminJwt).toBeTypeOf("function");
    expect(adminSession).toBeTypeOf("function");

    const customerToken = await clientJwt!({
      token: {},
      user: {
        id: "customer-ana",
        name: "Ana",
        email: "ana@pvcasa.com",
        role: "customer",
        customerId: "customer-ana",
      },
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    } as never);
    const adminToken = await adminJwt!({
      token: {},
      user: {
        id: "pvcasa-admin",
        name: "PV Casa Admin",
        email: "admin@pvcasa.com.br",
        role: "admin",
        isAdmin: true,
      },
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    } as never);

    expect(customerToken).toMatchObject({ customerId: "customer-ana", isAdmin: false });
    expect(adminToken).toMatchObject({ isAdmin: true });
    expect(adminToken.customerId).toBeUndefined();

    const customerSession = await clientSession!({
      session: { user: {}, expires: new Date(Date.now() + 1000).toISOString() },
      token: customerToken,
      user: undefined,
      newSession: undefined,
      trigger: undefined,
    } as never);
    const nextAdminSession = await adminSession!({
      session: { user: {}, expires: new Date(Date.now() + 1000).toISOString() },
      token: adminToken,
      user: undefined,
      newSession: undefined,
      trigger: undefined,
    } as never);

    expect(customerSession.user).toMatchObject({
      customerId: "customer-ana",
      role: "customer",
    });
    expect(nextAdminSession.user).toMatchObject({
      isAdmin: true,
      role: "admin",
    });
  });
});
