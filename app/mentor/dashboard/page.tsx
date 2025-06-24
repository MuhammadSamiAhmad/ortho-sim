"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Activity,
  TrendingUp,
  Clock,
  Trophy,
  Calendar,
  BarChart3,
  Star,
} from "lucide-react";
import MentorLayout from "@/components/mentor/MentorLayout";
import Link from "next/link";

interface DashboardStats {
  totalTrainees: number;
  activeTrainees: number;
  totalAttempts: number;
  averageScore: number;
  totalTrainingHours: number;
  feedbackGiven: number;
}

interface TopTrainee {
  id: string;
  name: string;
  email: string;
  bestScore: string;
  totalAttempts: number;
  averageScore: string;
  rank: number;
}

interface RecentAttempt {
  id: string;
  trainee: {
    name: string;
  };
  score: string;
  attemptDate: string;
  isCompleted: boolean;
  feedbackCount: number;
}

export default function MentorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topTrainees, setTopTrainees] = useState<TopTrainee[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const [statsRes, traineesRes, attemptsRes] = await Promise.all([
        fetch("/api/mentor/dashboard/stats"),
        fetch("/api/mentor/dashboard/top-trainees"),
        fetch("/api/mentor/dashboard/recent-attempts"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (traineesRes.ok) {
        const traineesData = await traineesRes.json();
        setTopTrainees(traineesData);
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

  if (isLoading) {
    return (
      <MentorLayout currentPage="dashboard">
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
      </MentorLayout>
    );
  }

  return (
    <MentorLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-300">
              Welcome back, {session?.user?.name}! Here&apos;s your training
              overview.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    Total Trainees
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats?.totalTrainees || 0}
                  </p>
                  <p className="text-green-400 text-sm mt-1">
                    {stats?.activeTrainees || 0} active
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-gray-400 text-sm mt-1">All trainees</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-400" />
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
                    {stats?.averageScore?.toFixed(1) || 0}%
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Across all attempts
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#00cfb6]/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#00cfb6]" />
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
                  <p className="text-gray-400 text-sm mt-1">Total time</p>
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
                    Feedback Given
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats?.feedbackGiven || 0}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Total feedback</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 flex items-center justify-center">
              <Link href="/mentor/rankings" className="w-full">
                <Button className="w-full bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Full Rankings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Top Trainees and Recent Attempts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 4 Trainees */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-[#00cfb6]" />
                  Top Performers
                </CardTitle>
                <Link href="/mentor/rankings">
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
              {topTrainees.length > 0 ? (
                <div className="space-y-3">
                  {topTrainees.slice(0, 4).map((trainee, index) => (
                    <div
                      key={trainee.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00cfb6] text-slate-900 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {trainee.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {trainee.totalAttempts} attempts
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-sm ${getScoreColor(
                            trainee.bestScore
                          )}`}
                        >
                          {trainee.bestScore}
                        </p>
                        <p className="text-gray-400 text-xs">Best Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No trainee data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Surgery Attempts */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-[#00cfb6]" />
                  Recent Attempts
                </CardTitle>
                <Link href="/mentor/trainees">
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
                  {recentAttempts.slice(0, 5).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-white font-medium text-sm">
                          {attempt.trainee.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {formatDate(attempt.attemptDate)}
                        </p>
                      </div>
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
                        <span
                          className={`font-bold text-sm ${getScoreColor(
                            attempt.score
                          )}`}
                        >
                          {attempt.score}
                        </span>
                        {attempt.feedbackCount === 0 && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">
                            No Feedback
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No recent attempts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MentorLayout>
  );
}
