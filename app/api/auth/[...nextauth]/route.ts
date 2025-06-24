// app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/auth"; // Assumes auth.ts is at the root
export const { GET, POST } = handlers;
