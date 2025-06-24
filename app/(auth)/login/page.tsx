"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { LoginSchema, type LoginData } from "@/lib/validations";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ErrorState {
  type: "general" | "email" | "password" | "validation";
  message: string;
}

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formFieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);

  const form = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Clear error when user starts typing
  const clearError = () => {
    if (error) {
      setError(null);
    }
  };

  // GSAP animations
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Set initial states
      gsap.set([headerRef.current, cardRef.current], {
        opacity: 0,
        y: 30,
      });

      gsap.set(formFieldRefs.current, {
        opacity: 0,
        x: -20,
      });

      // Animate entrance
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
      })
        .to(
          cardRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.2"
        )
        .to(
          formFieldRefs.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.2,
          },
          "-=0.1"
        );
    },
    { scope: containerRef }
  );

  // Animate error appearance
  useGSAP(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [error]);

  const onSubmit = async (data: LoginData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Use NextAuth signIn function
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Don't redirect automatically
      });

      if (result?.error) {
        // Handle different types of errors
        if (result.error === "CredentialsSignin") {
          setError({
            type: "general",
            message:
              "Invalid email or password. Please check your credentials and try again.",
          });
        } else {
          setError({
            type: "general",
            message: "An error occurred during sign in. Please try again.",
          });
        }
        return;
      }

      if (result?.ok) {
        const session = await getSession();

        if (session && session.user) {
          // Success animation
          const exitTl = gsap.timeline({
            onComplete: () => {
              // This line is now safe and will not have an error
              const redirectPath =
                session.user.userType === "MENTOR"
                  ? "/mentor/dashboard"
                  : "/trainee/dashboard";
              router.push(redirectPath);
            },
          });

          exitTl.to([headerRef.current, cardRef.current], {
            opacity: 0,
            y: -20,
            duration: 0.4,
            stagger: 0.1,
          });
        }
      }
    } catch (networkError: unknown) {
      console.error("Network error:", networkError);
      setError({
        type: "general",
        message:
          "Unable to connect to the server. Please check your internet connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div ref={containerRef} className="relative w-full max-w-md mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-300">
            Sign in to continue your surgical training
          </p>
        </div>

        {/* Login Card */}
        <Card
          ref={cardRef}
          className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl"
        >
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-white">Sign In</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div
                ref={errorRef}
                className="p-3 rounded-lg border bg-red-500/10 border-red-500/20 text-red-300 flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Sign In Failed</p>
                  <p className="opacity-90">{error.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div
                ref={(el) => {
                  formFieldRefs.current[0] = el;
                }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="your.email@example.com"
                    onChange={(e) => {
                      form.register("email").onChange(e);
                      clearError();
                    }}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-red-400 text-sm">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div
                ref={(el) => {
                  formFieldRefs.current[1] = el;
                }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={(e) => {
                      form.register("password").onChange(e);
                      clearError();
                    }}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-400 text-sm">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-semibold py-3 rounded-lg transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm mb-4">
                Don&apos;t have an account?
              </p>
              <Link href="/get-started">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white hover:border-[#00cfb6]"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
