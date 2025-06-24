// middleware.ts

import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // Import the new Edge-safe config

// Initialize NextAuth.js with the authConfig and export the resulting middleware.
// This middleware will now handle all the authorization logic defined in the `authorized` callback.
export default NextAuth(authConfig).auth;

// The matcher remains the same, specifying which routes the middleware runs on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (this is now handled by the auth logic itself)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
