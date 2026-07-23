import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const response = await axios.post(`${apiBase}/login`, {
            email: credentials?.email,
            password: credentials?.password
          });
          
          if (response.data.success) {
            return {
              id: response.data.user.id,
              name: response.data.user.name,
              email: response.data.user.email,
              token: response.data.token
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const response = await axios.post(`${apiBase}/auth/google`, {
            idToken: account.id_token,
            name: user.name,
            email: user.email,
            image: user.image
          });
          
          if (response.data.success) {
            (user as any).backendToken = response.data.token;
            (user as any).backendUser = response.data.user;
            return true;
          }
          return false;
        } catch (error: any) {
          console.error("Google sign in error:", error.response?.data || error.message);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user) {
        token.backendToken = (user as any).backendToken;
        token.backendUser = (user as any).backendUser;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).backendToken = token.backendToken as string;
        (session.user as any).backendUser = token.backendUser as any;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };