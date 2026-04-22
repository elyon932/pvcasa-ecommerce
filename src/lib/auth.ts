import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getCustomerByEmail } from "@/lib/accounts";

const fallbackHash =
  process.env.ADMIN_PASSWORD_HASH ??
  "$2b$12$lgjLXqNCd2ZrnBXOiCaR1Og8IafxIAI8kJ7.dU6xWwrPG8zybkSl2";

export async function authorizeAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@pvcasa.com.br")
    .toLowerCase()
    .trim();
  const isValidPassword = await bcrypt.compare(password, fallbackHash);

  if (normalizedEmail !== adminEmail || !isValidPassword) {
    return null;
  }

  return {
    id: "pvcasa-admin",
    email: adminEmail,
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
