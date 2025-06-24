"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Building,
  GraduationCap,
  Key,
  Shield,
  Bell,
  Save,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import MentorLayout from "@/components/mentor/MentorLayout";

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  specialization: z.string().min(1, "Specialization is required"),
  qualification: z.string().min(1, "Qualification is required"),
  department: z.string().optional(),
});

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileData = z.infer<typeof ProfileSchema>;
type PasswordData = z.infer<typeof PasswordSchema>;

interface MentorProfile {
  name: string;
  email: string;
  specialization?: string;
  qualification?: string;
  department?: string;
  mentorCode: string;
  mentorCodeExpiry?: string;
  isCodeActive: boolean;
  createdAt: string;
}

export default function MentorSettingsPage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(ProfileSchema),
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(PasswordSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/mentor/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        profileForm.reset({
          name: data.name,
          email: data.email,
          specialization: data.specialization || "",
          qualification: data.qualification || "",
          department: data.department || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileData) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/mentor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);

        // Update session if name or email changed
        if (
          data.name !== session?.user?.name ||
          data.email !== session?.user?.email
        ) {
          await update({
            ...session,
            user: {
              ...session?.user,
              name: data.name,
              email: data.email,
            },
          });
        }

        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Failed to update profile",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred while updating profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    setIsChangingPassword(true);
    setMessage(null);

    try {
      const response = await fetch("/api/mentor/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (response.ok) {
        passwordForm.reset();
        setMessage({ type: "success", text: "Password changed successfully!" });
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Failed to change password",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred while changing password",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const generateNewCode = async () => {
    try {
      const response = await fetch("/api/mentor/code", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setProfile((prev) =>
          prev ? { ...prev, mentorCode: data.mentorCode } : null
        );
        setMessage({ type: "success", text: "New mentor code generated!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to generate new code" });
    }
  };

  const copyToClipboard = async () => {
    if (profile?.mentorCode) {
      try {
        await navigator.clipboard.writeText(profile.mentorCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <MentorLayout currentPage="settings">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-600 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout currentPage="settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Account Settings
          </h1>
          <p className="text-gray-300">
            Manage your profile, security, and mentor preferences
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-300"
                : "bg-red-500/10 border-red-500/20 text-red-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-[#00cfb6]" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      {...profileForm.register("name")}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                    />
                  </div>
                  {profileForm.formState.errors.name && (
                    <p className="text-red-400 text-sm">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      {...profileForm.register("email")}
                      type="email"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                    />
                  </div>
                  {profileForm.formState.errors.email && (
                    <p className="text-red-400 text-sm">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Specialization
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      {...profileForm.register("specialization")}
                      placeholder="e.g., Orthopedic Surgery"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                    />
                  </div>
                  {profileForm.formState.errors.specialization && (
                    <p className="text-red-400 text-sm">
                      {profileForm.formState.errors.specialization.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Qualification
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      {...profileForm.register("qualification")}
                      placeholder="e.g., MD, FRCS"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                    />
                  </div>
                  {profileForm.formState.errors.qualification && (
                    <p className="text-red-400 text-sm">
                      {profileForm.formState.errors.qualification.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Department (Optional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      {...profileForm.register("department")}
                      placeholder="e.g., Orthopedics Department"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#00cfb6]" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      {...passwordForm.register("currentPassword")}
                      type="password"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                    />
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-red-400 text-sm">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    New Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      {...passwordForm.register("newPassword")}
                      type="password"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                    />
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-400 text-sm">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      {...passwordForm.register("confirmPassword")}
                      type="password"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
                    />
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-400 text-sm">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full bg-red-600 hover:bg-red-600/90 text-white font-medium"
                >
                  {isChangingPassword ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Mentor Code Management */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="w-5 h-5 mr-2 text-[#00cfb6]" />
                Mentor Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Current Code:</span>
                  <Badge
                    className={
                      profile?.isCodeActive
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {profile?.isCodeActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-white/10 px-3 py-2 rounded text-[#00cfb6] font-mono text-lg">
                    {profile?.mentorCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-white"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {profile?.mentorCodeExpiry && (
                  <p className="text-gray-400 text-xs mt-2">
                    Expires:{" "}
                    {new Date(profile.mentorCodeExpiry).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={generateNewCode}
                  className="w-full bg-yellow-600 hover:bg-yellow-600/90 text-white font-medium"
                >
                  Generate New Code
                </Button>
                <p className="text-gray-400 text-xs">
                  Generating a new code will invalidate the current one. Share
                  the new code with your trainees.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-[#00cfb6]" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Type:</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Mentor
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Member Since:</span>
                  <span className="text-white">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">User ID:</span>
                  <span className="text-white font-mono text-sm">
                    {session?.user?.id}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MentorLayout>
  );
}
