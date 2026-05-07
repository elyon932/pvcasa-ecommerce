import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getCustomerByEmail } from "@/lib/accounts";
import { ADMIN_SESSION_COOKIE, CLIENT_SESSION_COOKIE } from "@/lib/auth-cookies";

export const CLIENT_SESSION_MAX_AGE = 30 * 24 * 60 * 60;
export const ADMIN_SESSION_MAX_AGE = 12 * 60 * 60;

const DEVELOPMENT_ADMIN_EMAIL = "admin@pvcasa.com.br";
const DEVELOPMENT_ADMIN_PASSWORD_HASH =
  "$2b$12$lgjLXqNCd2ZrnBXOiCaR1Og8IafxIAI8kJ7.dU6xWwrPG8zybkSl2";

function isValidBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

function getAdminCredentialsConfig() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (email && passwordHash && isValidBcryptHash(passwordHash)) {
    return { email, passwordHash };
  }

  if (process.env.NODE_ENV === "development") {
    return {
      email: DEVELOPMENT_ADMIN_EMAIL,
      passwordHash: DEVELOPMENT_ADMIN_PASSWORD_HASH,
    };
  }

  return null;
}

export async function authorizeAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const adminCredentials = getAdminCredentialsConfig();

  if (!adminCredentials) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, adminCredentials.passwordHash);

  if (normalizedEmail !== adminCredentials.email || !isValidPassword) {
    return null;
  }

  return {
    id: "pvcasa-admin",
    email: adminCredentials.email,
    name: "PV Casa Admin",
    role: "admin",
    isAdmin: true,
  };
}

export async function authorizeCustomerCredentials(email: string, password: string) {
  const customer = await getCustomerByEmail(email.toLowerCase().trim());
  if (!customer) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, customer.passwordHash);
  if (!isValidPassword) {
    return null;
  }

  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    role: "customer",
    customerId: customer.id,
  };
}

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
    maxAge,
  };
}

const sessionCallbacks: NextAuthOptions["callbacks"] = {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;
      token.isAdmin = user.isAdmin === true || user.role === "admin";
      token.customerId = user.customerId;
    }

    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.isAdmin = token.isAdmin === true;
      session.user.customerId =
        typeof token.customerId === "string" ? token.customerId : undefined;
      session.user.role = session.user.customerId
        ? "customer"
        : session.user.isAdmin
          ? "admin"
          : typeof token.role === "string"
            ? token.role
            : undefined;
    }

    return session;
  },
};

export const clientAuthOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: CLIENT_SESSION_MAX_AGE,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: CLIENT_SESSION_COOKIE,
      options: sessionCookieOptions(CLIENT_SESSION_MAX_AGE),
    },
  },
  providers: [
    CredentialsProvider({
      id: "customer-credentials",
      name: "Customer credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authorizeCustomerCredentials(
          String(credentials?.email ?? ""),
          String(credentials?.password ?? ""),
        );
      },
    }),
  ],
  callbacks: sessionCallbacks,
};

export const adminAuthOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: ADMIN_SESSION_MAX_AGE,
    updateAge: 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: ADMIN_SESSION_COOKIE,
      options: sessionCookieOptions(ADMIN_SESSION_MAX_AGE),
    },
  },
  providers: [],
  callbacks: sessionCallbacks,
};

export const authOptions = clientAuthOptions;
