// auth.config.ts

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // 1. AUTHORIZATION (MIDDLEWARE)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isProtectedRoute =
        pathname.startsWith("/mentor") || pathname.startsWith("/trainee");

      if (isProtectedRoute) {
        if (isLoggedIn) {
          // This check will now work because `auth.user` will have userType
          const userType = auth.user.userType;

          if (pathname.startsWith("/mentor") && userType !== "MENTOR") {
            return Response.redirect(new URL("/unauthorized", nextUrl));
          }
          if (pathname.startsWith("/trainee") && userType !== "TRAINEE") {
            return Response.redirect(new URL("/unauthorized", nextUrl));
          }
          return true; // All good, allow access
        }
        return false; // Not logged in, redirect to login
      } else if (isLoggedIn) {
        if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
          const dashboardUrl =
            auth.user.userType === "MENTOR"
              ? "/mentor/dashboard"
              : "/trainee/dashboard";
          return Response.redirect(new URL(dashboardUrl, nextUrl));
        }
      }
      return true; // Allow all other routes
    },

    // 2. JWT (TOKEN ENRICHMENT) - MOVED HERE
    // This callback runs whenever a JWT is created or updated.
    async jwt({ token, user }) {
      if (user) {
        // On sign in, add custom properties from the 'user' object to the token
        token.id = user.id;
        token.userType = user.userType;
        token.profileImage = user.profileImage;
        token.traineeProfileId = user.traineeProfileId;
        token.mentorProfileId = user.mentorProfileId;
      }
      return token;
    },

    // 3. SESSION (CLIENT-SIDE DATA) - MOVED HERE
    // This callback runs when a session is accessed client-side.
    async session({ session, token }) {
      if (session.user && token) {
        // Add the custom properties from the token to the client-side session object
        session.user.id = token.id as string;
        session.user.userType = token.userType;
        session.user.profileImage = token.profileImage;
        session.user.traineeProfileId = token.traineeProfileId;
        session.user.mentorProfileId = token.mentorProfileId;
      }
      return session;
    },
  },
  providers: [], // Keep this empty!
} satisfies NextAuthConfig;
