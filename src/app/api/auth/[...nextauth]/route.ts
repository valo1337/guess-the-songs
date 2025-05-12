import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Extend the default types to include custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
      isAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    username?: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    isAdmin?: boolean;
  }
}

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          console.error('No credentials provided');
          return null;
        }
        const { email, password } = credentials;
        try {
          // Find user by email or username
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: email },
                { username: email },
              ],
            },
          });

          if (!user) {
            console.error(`User not found for email/username: ${email}`);
            return null;
          }

          if (!user.password) {
            console.error(`No password found for user: ${email}`);
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            console.error(`Invalid password for user: ${email}`);
            return null;
          }

          console.log(`User authenticated successfully: ${email}`);
          const userWithAdmin = await prisma.user.findUnique({
            where: { id: user.id },
            select: { 
              id: true,
              name: true,
              email: true,
              image: true,
              username: true
            }
          });

          // Use raw query to fetch isAdmin
          const adminResult = await prisma.$queryRaw`
            SELECT isAdmin FROM User WHERE id = ${user.id}
          `;

          const isAdmin = Array.isArray(adminResult) && adminResult.length > 0 
            ? (adminResult[0] as any).isAdmin === 1 
            : false;

          return {
            id: userWithAdmin?.id || user.id,
            name: userWithAdmin?.name,
            email: userWithAdmin?.email,
            image: userWithAdmin?.image,
            username: userWithAdmin?.username,
            isAdmin,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
    // GoogleProvider({ ... }) // Add later if needed
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login", // Error code passed in query string as ?error=
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.isAdmin = token.isAdmin;
      }
      console.log('Session callback:', { session, token });
      return session;
    },
    async jwt({ token, user }) {
      // Add username and id to token if it's a new login
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logging
});

export { handler as GET, handler as POST }; 