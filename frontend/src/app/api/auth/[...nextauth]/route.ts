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
          const response = await axios.post(`${process.env.NEXTAUTH_URL}/api/login`, {
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
    async signIn({ user, account, profile }) {
      console.log("SignIn callback - provider:", account?.provider);
      
      if (account?.provider === "google") {
        try {
          console.log("Sending to backend:", { name: user.name, email: user.email });
          
          const response = await axios.post(`http://localhost:5000/api/auth/google`, {
            name: user.name,
            email: user.email,
            image: user.image
          });
          
          console.log("Backend response:", response.data);
          
          if (response.data.success) {
            user.backendToken = response.data.token;
            user.backendUser = response.data.user;
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
      session.user.id = token.id as string;
      session.user.backendToken = token.backendToken as string;
      session.user.backendUser = token.backendUser as any;
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  useSecureCookies: false, // Important for localhost
});

export { handler as GET, handler as POST };