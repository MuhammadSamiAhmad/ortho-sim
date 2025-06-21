"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building,
  GraduationCap,
  Code,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import {
  MentorRegistrationSchema,
  TraineeRegistrationSchema,
  type MentorRegistrationData,
  type TraineeRegistrationData,
} from "@/lib/validations";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ErrorState {
  type: "general" | "email" | "mentorCode" | "validation";
  message: string;
  field?: string;
}

interface SuccessState {
  type: "mentor" | "trainee";
  message: string;
  mentorCode?: string;
}

// API Response types
interface RegistrationSuccessResponse {
  success: true;
  userId: string;
  name: string;
  userType: "MENTOR" | "TRAINEE";
  mentorCode?: string;
  traineeProfileId?: string;
  mentorProfileId?: string;
}

interface RegistrationErrorResponse {
  error: string;
  message: string;
}

interface ValidationErrorResponse {
  error: string;
  details: Array<{
    field: string | number;
    message: string;
  }>;
}

type ApiResponse =
  | RegistrationSuccessResponse
  | RegistrationErrorResponse
  | ValidationErrorResponse;

const RegisterPage = () => {
  const router = useRouter();
  const { userType, setUser, setLoading, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formFieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Redirect if no user type selected - with delay for store hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userType) {
        router.push("/get-started");
        return;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [userType, router]);

  // Form setup based on user type
  const isMentor = userType === "MENTOR";

  const mentorForm = useForm<MentorRegistrationData>({
    resolver: zodResolver(MentorRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      specialization: "",
      qualification: "",
    },
  });

  const traineeForm = useForm<TraineeRegistrationData>({
    resolver: zodResolver(TraineeRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      institution: "",
      graduationYear: new Date().getFullYear(),
      mentorCode: "",
    },
  });

  // GSAP animations
  useGSAP(
    () => {
      if (!userType) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Set initial states
      gsap.set([headerRef.current, cardRef.current], {
        opacity: 0,
        y: 30,
      });

      gsap.set(formFieldRefs.current.filter(Boolean), {
        opacity: 0,
        x: -20,
      });

      // Animate entrance
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
      })
        .to(
          cardRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.3"
        )
        .to(
          formFieldRefs.current.filter(Boolean),
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.1,
          },
          "-=0.2"
        );
    },
    { scope: containerRef, dependencies: [userType] }
  );

  // Animate error/success messages
  useGSAP(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [error]);

  useGSAP(() => {
    if (success && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [success]);

  // Shared registration handler
  const handleRegistration = async (
    data: MentorRegistrationData | TraineeRegistrationData
  ) => {
    setIsSubmitting(true);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userType }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        // Handle different types of errors
        switch (response.status) {
          case 400:
            // Validation errors
            if ("details" in result && Array.isArray(result.details)) {
              const firstError = result.details[0];
              setError({
                type: "validation",
                message: firstError.message,
                field: firstError.field.toString(),
              });
            } else if ("message" in result) {
              setError({
                type: "general",
                message: result.message,
              });
            } else {
              setError({
                type: "general",
                message: "Please check your input and try again.",
              });
            }
            break;

          case 404:
            // Mentor code not found
            setError({
              type: "mentorCode",
              message:
                "message" in result
                  ? result.message
                  : "The mentor code you entered doesn't exist.",
            });
            break;

          case 403:
            // Mentor code inactive or expired
            setError({
              type: "mentorCode",
              message:
                "message" in result
                  ? result.message
                  : "The mentor code is no longer active.",
            });
            break;

          case 409:
            // Account already exists
            setError({
              type: "email",
              message:
                "message" in result
                  ? result.message
                  : "An account with this email already exists.",
            });
            break;

          case 500:
            // Server error
            setError({
              type: "general",
              message:
                "message" in result
                  ? result.message
                  : "Something went wrong. Please try again later.",
            });
            break;

          default:
            setError({
              type: "general",
              message: "An unexpected error occurred. Please try again.",
            });
        }
        return;
      }

      // Type guard for success response
      if ("success" in result && result.success) {
        // Set user in store
        setUser({
          id: result.userId,
          email: data.email,
          name: result.name,
          userType: result.userType,
        });

        // Show success message first
        if (isMentor && result.mentorCode) {
          setSuccess({
            type: "mentor",
            message: "Account created successfully!",
            mentorCode: result.mentorCode,
          });

          // Delay navigation to show mentor code
          setTimeout(() => {
            const exitTl = gsap.timeline({
              onComplete: () => {
                router.push("/mentor/dashboard");
              },
            });

            exitTl.to([headerRef.current, cardRef.current], {
              opacity: 0,
              y: -20,
              duration: 0.4,
              stagger: 0.1,
            });
          }, 3000);
        } else {
          setSuccess({
            type: "trainee",
            message: "Account created successfully! Redirecting...",
          });

          // Immediate navigation for trainee
          setTimeout(() => {
            const exitTl = gsap.timeline({
              onComplete: () => {
                router.push("/trainee/dashboard");
              },
            });

            exitTl.to([headerRef.current, cardRef.current], {
              opacity: 0,
              y: -20,
              duration: 0.4,
              stagger: 0.1,
            });
          }, 1500);
        }
      } else {
        // Fallback error handling
        setError({
          type: "general",
          message: "An unexpected response was received. Please try again.",
        });
      }
    } catch (networkError: unknown) {
      console.error("Network error:", networkError);

      // Handle different types of network errors
      if (networkError instanceof TypeError) {
        setError({
          type: "general",
          message:
            "Unable to connect to the server. Please check your internet connection and try again.",
        });
      } else if (networkError instanceof Error) {
        setError({
          type: "general",
          message: `Network error: ${networkError.message}`,
        });
      } else {
        setError({
          type: "general",
          message: "An unexpected network error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Show loading while checking userType
  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00cfb6]/30 border-t-[#00cfb6] rounded-full animate-spin" />
      </div>
    );
  }

  // Mentor form fields - FIXED: Removed 'department' field to match schema
  const mentorFields = [
    {
      name: "name" as keyof MentorRegistrationData,
      label: "Full Name",
      type: "text",
      icon: User,
      placeholder: "Dr. John Smith",
    },
    {
      name: "email" as keyof MentorRegistrationData,
      label: "Email",
      type: "email",
      icon: Mail,
      placeholder: "john.smith@hospital.com",
    },
    {
      name: "password" as keyof MentorRegistrationData,
      label: "Password",
      type: "password",
      icon: Lock,
      placeholder: "••••••••",
    },
    {
      name: "specialization" as keyof MentorRegistrationData,
      label: "Specialization",
      type: "text",
      icon: GraduationCap,
      placeholder: "Orthopedic Surgery",
    },
    {
      name: "qualification" as keyof MentorRegistrationData,
      label: "Qualification",
      type: "text",
      icon: GraduationCap,
      placeholder: "MD, FRCS",
    },
  ];

  // Trainee form fields
  const traineeFields = [
    {
      name: "name" as keyof TraineeRegistrationData,
      label: "Full Name",
      type: "text",
      icon: User,
      placeholder: "John Doe",
    },
    {
      name: "email" as keyof TraineeRegistrationData,
      label: "Email",
      type: "email",
      icon: Mail,
      placeholder: "john.doe@university.edu",
    },
    {
      name: "password" as keyof TraineeRegistrationData,
      label: "Password",
      type: "password",
      icon: Lock,
      placeholder: "••••••••",
    },
    {
      name: "institution" as keyof TraineeRegistrationData,
      label: "Institution",
      type: "text",
      icon: Building,
      placeholder: "Medical University",
    },
    {
      name: "graduationYear" as keyof TraineeRegistrationData,
      label: "Graduation Year",
      type: "number",
      icon: Calendar,
      placeholder: "2025",
    },
    {
      name: "mentorCode" as keyof TraineeRegistrationData,
      label: "Mentor Code",
      type: "text",
      icon: Code,
      placeholder: "Enter mentor's code",
    },
  ];

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
            Create {isMentor ? "Mentor" : "Trainee"} Account
          </h1>
          <p className="text-gray-300">
            Join OrthoSim and start your surgical training journey
          </p>
        </div>

        {/* Registration Card */}
        <Card
          ref={cardRef}
          className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl"
        >
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-white">
              {isMentor ? "Mentor Registration" : "Trainee Registration"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success Message */}
            {success && (
              <div
                ref={successRef}
                className="p-4 rounded-lg border bg-green-500/10 border-green-500/20 text-green-300"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Success!</p>
                    <p className="opacity-90 mb-2">{success.message}</p>
                    {success.mentorCode && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mt-2">
                        <p className="font-medium text-green-200 mb-1">
                          Your Mentor Code:
                        </p>
                        <code className="text-lg font-mono bg-green-500/30 px-2 py-1 rounded text-green-100">
                          {success.mentorCode}
                        </code>
                        <p className="text-xs text-green-300 mt-2">
                          Share this code with your trainees. Save it somewhere
                          safe!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                ref={errorRef}
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  error.type === "email"
                    ? "bg-orange-500/10 border-orange-500/20 text-orange-300"
                    : error.type === "mentorCode"
                    ? "bg-red-500/10 border-red-500/20 text-red-300"
                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                }`}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">
                    {error.type === "email" && "Email Already Exists"}
                    {error.type === "mentorCode" && "Invalid Mentor Code"}
                    {error.type === "validation" && "Input Error"}
                    {error.type === "general" && "Error"}
                  </p>
                  <p className="opacity-90">{error.message}</p>
                </div>
              </div>
            )}

            {/* Mentor Registration Form */}
            {isMentor && (
              <form
                onSubmit={mentorForm.handleSubmit(handleRegistration)}
                className="space-y-4"
              >
                {mentorFields.map((field, index) => {
                  const Icon = field.icon;
                  const formError = mentorForm.formState.errors[field.name];
                  const hasServerError = error?.field === field.name;
                  return (
                    <div
                      key={field.name}
                      ref={(el) => {
                        formFieldRefs.current[index] = el;
                      }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium text-gray-300">
                        {field.label}
                      </label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          {...mentorForm.register(field.name)}
                          type={
                            field.name === "password" && showPassword
                              ? "text"
                              : field.type
                          }
                          placeholder={field.placeholder}
                          className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6] ${
                            hasServerError || formError
                              ? field.name === "email"
                                ? "border-orange-500/50"
                                : field.name === "mentorCode"
                                ? "border-red-500/50"
                                : "border-yellow-500/50"
                              : ""
                          }`}
                        />
                        {field.name === "password" && (
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
                        )}
                      </div>
                      {formError && (
                        <p className="text-red-400 text-sm">
                          {formError.message}
                        </p>
                      )}
                    </div>
                  );
                })}
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading || !!success}
                  className="w-full bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  ) : success ? (
                    "Account Created!"
                  ) : (
                    "Create Mentor Account"
                  )}
                </Button>
              </form>
            )}

            {/* Trainee Registration Form */}
            {!isMentor && (
              <form
                onSubmit={traineeForm.handleSubmit(handleRegistration)}
                className="space-y-4"
              >
                {traineeFields.map((field, index) => {
                  const Icon = field.icon;
                  const formError = traineeForm.formState.errors[field.name];
                  const hasServerError = error?.field === field.name;
                  return (
                    <div
                      key={field.name}
                      ref={(el) => {
                        formFieldRefs.current[index] = el;
                      }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium text-gray-300">
                        {field.label}
                      </label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          {...traineeForm.register(field.name, {
                            valueAsNumber: field.name === "graduationYear",
                          })}
                          type={
                            field.name === "password" && showPassword
                              ? "text"
                              : field.type
                          }
                          placeholder={field.placeholder}
                          className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6] ${
                            hasServerError || formError
                              ? field.name === "email"
                                ? "border-orange-500/50"
                                : field.name === "mentorCode"
                                ? "border-red-500/50"
                                : "border-yellow-500/50"
                              : ""
                          }`}
                        />
                        {field.name === "password" && (
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
                        )}
                      </div>
                      {formError && (
                        <p className="text-red-400 text-sm">
                          {formError.message}
                        </p>
                      )}
                    </div>
                  );
                })}
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading || !!success}
                  className="w-full bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  ) : success ? (
                    "Account Created!"
                  ) : (
                    "Create Trainee Account"
                  )}
                </Button>
              </form>
            )}

            {!success && (
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm mb-4">
                  Already have an account?
                </p>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white hover:border-[#00cfb6]"
                  >
                    Sign In Instead
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        {!success && (
          <div className="text-center mt-6">
            <Link href="/get-started">
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Role Selection
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
