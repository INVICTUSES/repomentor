import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { getAuthSecret, isAuthConfigured } from "@/lib/auth-config";

const providers = isAuthConfigured()
  ? [
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
      }),
    ]
  : [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  secret: getAuthSecret(),
  trustHost: true,
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
