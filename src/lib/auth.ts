import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

interface AppUser {
  username: string;
  password_hash: string;
  partner_code: string;
  name: string;
}

function getUsers(): AppUser[] {
  try {
    const raw = process.env.USERS_JSON;
    if (!raw) return [];
    return JSON.parse(raw) as AppUser[];
  } catch {
    console.error("Failed to parse USERS_JSON");
    return [];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // Sanitize input length to prevent DoS
        const username = credentials.username.trim().slice(0, 100);
        const password = credentials.password.slice(0, 200);

        const users = getUsers();
        const user = users.find((u) => u.username === username);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.partner_code,
          name: user.name,
          email: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, persist partner_code to token
      if (user) {
        token.partnerCode = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose partner_code to client session
      if (token.partnerCode) {
        (session.user as { partnerCode?: string }).partnerCode =
          token.partnerCode as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
