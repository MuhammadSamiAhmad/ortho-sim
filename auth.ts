// auth.ts

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { LoginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { email, password } = await LoginSchema.parseAsync(credentials);
          const user = await prisma.user.findUnique({
            where: { email },
            include: { traineeProfile: true, mentorProfile: true },
          });

          if (!user || !(await bcrypt.compare(password, user.password))) {
            return null;
          }

          // --- THIS IS THE FIX ---
          // Instead of 'return user;', we now construct an object that
          // perfectly matches our augmented `User` interface.
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            profileImage: user.profileImage,
            // We flatten the nested profile objects into simple ID properties.
            mentorProfileId: user.mentorProfile?.id || null,
            traineeProfileId: user.traineeProfile?.id || null,
          };
          // ------------------------
        } catch (error) {
          // Log the error for debugging but don't expose details to the client
          console.error("Authorization Error:", error);
          return null;
        }
      },
    }),
  ],
  // The rest of the config (session strategy, secret, etc.) is inherited from authConfig
  // or can be defined here if needed.
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});
