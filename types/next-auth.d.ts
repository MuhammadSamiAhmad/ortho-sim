// types/next-auth.d.ts

import type { DefaultSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt"; // Rename to avoid conflict

// Define your custom user role
type UserRole = "MENTOR" | "TRAINEE";

// Tell TypeScript what your custom properties are
declare module "next-auth" {
  /**
   * Extends the built-in session.user type
   */
  interface Session {
    user: {
      id: string;
      userType: UserRole;
      profileImage: string | null;
      traineeProfileId: string | null;
      mentorProfileId: string | null;
    } & DefaultSession["user"]; // Keep default properties like name, email
  }

  /**
   * Extends the built-in user type (from the authorize callback)
   */
  interface User {
    userType: UserRole;
    profileImage: string | null;
    traineeProfileId: string | null;
    mentorProfileId: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in token type
   */
  interface JWT extends NextAuthJWT {
    userType: UserRole;
    profileImage: string | null;
    traineeProfileId: string | null;
    mentorProfileId: string | null;
  }
}
