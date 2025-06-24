"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  TrendingUp,
  Clock,
  Trophy,
  Calendar,
  Target,
  MessageSquare,
  Star,
  User,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import TraineeLayout from "@/components/trainee/TraineeLayout";
import Link from "next/link";

interface DashboardStats {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  bestScore: number;
  totalTrainingHours: number;
  improvementRate: number;
  feedbackReceived: number;
  currentRank: number | null;
  mentorName: string | null;
}

interface RecentAttempt {
  id: string;
  attemptDate: string;
  score: string;
  isCompleted: boolean;
  totalTime: number;
  feedbacks: Array<{
    id: string;
    comment: string;
    rating?: number;
    mentor: {
      user: {
        name: string;
      };
    };
  }>;
}

export default function TraineeDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, attemptsRes] = await Promise.all([
        fetch("/api/trainee/dashboard/stats"),
        fetch("/api/trainee/attempts?limit=5"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log("Dashboard stats data:", statsData);
        setStats(statsData);
      }

      if (attemptsRes.ok) {
        const attemptsData = await attemptsRes.json();
        setRecentAttempts(attemptsData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: string) => {
    const numericScore = Number.parseInt(score.replace("%", ""));
    if (numericScore >= 80) return "text-green-400";
    if (numericScore >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getImprovementColor = (rate: number) => {
    if (rate > 0) return "text-green-400";
    if (rate < 0) return "text-red-400";
    return "text-gray-400";
  };

  if (isLoading) {
    return (
      <TraineeLayout currentPage="dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-600 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TraineeLayout>
    );
  }

  return (
    <TraineeLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-300">
              Welcome back, {session?.user?.name}! Track your surgical training
              progress.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Total Attempts
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats?.totalAttempts || 0}
                  </p>
                  <p className="text-green-400 text-sm mt-1">
                    {stats?.completedAttempts || 0} completed
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Average Score
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats?.averageScore || 0}%
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Best: {stats?.bestScore || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#00cfb6]/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#00cfb6]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Training Hours
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats?.totalTrainingHours || 0}h
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp
                      className={`w-3 h-3 mr-1 ${getImprovementColor(
                        stats?.improvementRate || 0
                      )}`}
                    />
                    <span
                      className={`text-sm ${getImprovementColor(
                        stats?.improvementRate || 0
                      )}`}
                    >
                      {stats?.improvementRate || 0 > 0 ? "+" : ""}
                      {stats?.improvementRate || 0}% improvement
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Current Rank
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats?.currentRank ? `#${stats.currentRank}` : "Unranked"}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {stats?.feedbackReceived || 0} feedback received
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentor Info & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mentor Information */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-[#00cfb6]" />
                Your Mentor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#00cfb6] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {stats?.mentorName || "Not assigned"}
                    </p>
                    <p className="text-gray-400 text-sm">Supervising Surgeon</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-400 text-sm">
                    Your mentor provides feedback and guidance on your surgical
                    training progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-[#00cfb6]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/trainee/surgical-attempts">
                <Button className="w-full bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium justify-between">
                  View All Attempts
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/trainee/rankings">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 justify-between"
                >
                  Check Rankings
                  <Trophy className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/trainee/chatbot">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 justify-between"
                >
                  Ask AI Assistant
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-[#00cfb6]" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Completion Rate</span>
                  <span className="text-white font-medium">
                    {stats?.totalAttempts
                      ? Math.round(
                          (stats.completedAttempts / stats.totalAttempts) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Feedback Score</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-white font-medium">
                      {stats?.feedbackReceived ? "4.2/5" : "No ratings yet"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Progress Trend</span>
                  <Badge
                    className={`${
                      (stats?.improvementRate || 0) > 0
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : (stats?.improvementRate || 0) < 0
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {(stats?.improvementRate || 0) > 0
                      ? "Improving"
                      : (stats?.improvementRate || 0) < 0
                      ? "Declining"
                      : "Stable"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Surgery Attempts */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-[#00cfb6]" />
                Recent Surgery Attempts
              </CardTitle>
              <Link href="/trainee/surgical-attempts">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <span
                          className={`font-bold text-lg ${getScoreColor(
                            attempt.score
                          )}`}
                        >
                          {attempt.score}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatTime(attempt.totalTime)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {formatDate(attempt.attemptDate)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`text-xs ${
                              attempt.isCompleted
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {attempt.isCompleted ? "Complete" : "In Progress"}
                          </Badge>
                          {attempt.feedbacks.length > 0 && (
                            <Badge className="bg-[#00cfb6]/20 text-[#00cfb6] text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {attempt.feedbacks.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No surgery attempts yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Start your first VR simulation to begin tracking your progress
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TraineeLayout>
  );
}
