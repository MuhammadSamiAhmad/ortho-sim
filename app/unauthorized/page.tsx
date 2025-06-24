"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // If user is authenticated, redirect to their appropriate dashboard
    else if (status === "authenticated" && session?.user) {
      const redirectPath =
        session.user.userType === "MENTOR"
          ? "/mentor/dashboard"
          : "/trainee/dashboard";
      router.push(redirectPath);
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00cfb6]/30 border-t-[#00cfb6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-xl text-white">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">
            You don&apos;t have permission to access this page. Please make sure
            you&apos;re signed in with the correct account type.
          </p>
          <div className="space-y-2">
            <Link href="/">
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
