import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getCustomerByEmail } from "@/lib/accounts";

const DEVELOPMENT_ADMIN_EMAIL = "admin@pvcasa.com.br";
const DEVELOPMENT_ADMIN_PASSWORD_HASH =
  "$2b$12$lgjLXqNCd2ZrnBXOiCaR1Og8IafxIAI8kJ7.dU6xWwrPG8zybkSl2";

function getAdminCredentialsConfig() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (email && passwordHash) {
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

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authorizeAdminCredentials(
          String(credentials?.email ?? ""),
          String(credentials?.password ?? ""),
        );
      },
    }),
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.customerId = user.customerId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = typeof token.role === "string" ? token.role : undefined;
        session.user.customerId =
          typeof token.customerId === "string" ? token.customerId : undefined;
      }

      return session;
    },
  },
};
