import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      customerId?: string;
    };
  }

  interface User {
    role?: string;
    customerId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    customerId?: string;
  }
}
