"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Lock,
  Info,
  Calendar,
  GraduationCap,
  Building,
  Mail,
  UserCheck,
} from "lucide-react";
import TraineeLayout from "@/components/trainee/TraineeLayout";

interface TraineeProfile {
  name: string;
  email: string;
  institution?: string;
  graduationYear?: number;
  mentorName?: string;
  mentorEmail?: string;
  mentorSpecialization?: string;
  createdAt: string;
}

export default function TraineeSettings() {
  const [profile, setProfile] = useState<TraineeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    institution: "",
    graduationYear: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/trainee/profile");
      if (response.ok) {
        const data = await response.json();
        console.log("Profile data received:", data); // Debug log
        setProfile(data);
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          institution: data.institution || "",
          graduationYear: data.graduationYear?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/trainee/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileForm.name,
          institution: profileForm.institution || null,
          graduationYear: profileForm.graduationYear
            ? Number.parseInt(profileForm.graduationYear)
            : null,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "An error occurred while updating profile",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters long",
      });
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      const response = await fetch("/api/trainee/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setMessage({ type: "success", text: "Password changed successfully!" });
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({
        type: "error",
        text: "An error occurred while changing password",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <TraineeLayout currentPage="settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TraineeLayout>
    );
  }

  return (
    <TraineeLayout currentPage="settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-900/20 border border-green-800 text-green-400"
                : "bg-red-900/20 border border-red-800 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-blue-600"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-blue-600"
            >
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-blue-600"
            >
              <Info className="w-4 h-4 mr-2" />
              Account Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your personal information and training details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Full Name
                      </label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <Input
                        value={profileForm.email}
                        className="bg-gray-700 border-gray-600 text-gray-400"
                        disabled
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Institution
                      </label>
                      <Input
                        value={profileForm.institution}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            institution: e.target.value,
                          }))
                        }
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Your medical school or institution"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Expected Graduation Year
                      </label>
                      <Input
                        type="number"
                        value={profileForm.graduationYear}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            graduationYear: e.target.value,
                          }))
                        }
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="2025"
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={updating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Change Password</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {changingPassword
                      ? "Changing Password..."
                      : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Details</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your account information and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Email</p>
                      <p className="text-white">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Member Since
                      </p>
                      <p className="text-white">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Institution
                      </p>
                      <p className="text-white">
                        {profile?.institution || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        Graduation Year
                      </p>
                      <p className="text-white">
                        {profile?.graduationYear || "Not specified"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Mentor Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your assigned mentor details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.mentorName ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <UserCheck className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-300">
                            Mentor Name
                          </p>
                          <p className="text-white">{profile.mentorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-300">
                            Mentor Email
                          </p>
                          <p className="text-white">{profile.mentorEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-300">
                            Specialization
                          </p>
                          <p className="text-white">
                            {profile.mentorSpecialization || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-900/20 text-green-400 border-green-800">
                        Active Mentorship
                      </Badge>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No mentor assigned yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Contact your administrator to get assigned to a mentor
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TraineeLayout>
  );
}
