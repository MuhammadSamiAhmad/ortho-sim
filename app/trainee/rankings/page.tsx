"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Target,
  Clock,
  Star,
  Activity,
  Crown,
} from "lucide-react";
import TraineeLayout from "@/components/trainee/TraineeLayout";

interface LeaderboardEntry {
  id: string;
  rank: number;
  trainee: {
    name: string;
    email: string;
    institution?: string;
    graduationYear?: number;
  };
  totalAttempts: number;
  bestScore: string;
  averageScore: string;
  totalTrainingTime: number;
  improvementRate: number;
  lastActivity: string;
  isCurrentUser: boolean;
}

export default function TraineeRankingsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "bestScore" | "averageScore" | "totalAttempts" | "improvementRate"
  >("bestScore");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const response = await fetch("/api/trainee/rankings");

      if (!response.ok) {
        throw new Error(`Failed to fetch rankings: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setLeaderboard(data);
      } else {
        console.error("API returned non-array data:", data);
        setLeaderboard([]);
        setError("Invalid data format received from server");
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLeaderboard([]);
      setError(
        error instanceof Error ? error.message : "Failed to fetch rankings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sortedLeaderboard = Array.isArray(leaderboard)
    ? [...leaderboard].sort((a, b) => {
        switch (sortBy) {
          case "bestScore":
            return (
              Number.parseInt(b.bestScore.replace("%", "")) -
              Number.parseInt(a.bestScore.replace("%", ""))
            );
          case "averageScore":
            return (
              Number.parseInt(b.averageScore.replace("%", "")) -
              Number.parseInt(a.averageScore.replace("%", ""))
            );
          case "totalAttempts":
            return b.totalAttempts - a.totalAttempts;
          case "improvementRate":
            return b.improvementRate - a.improvementRate;
          default:
            return a.rank - b.rank;
        }
      })
    : [];

  const currentUser = sortedLeaderboard.find((entry) => entry.isCurrentUser);
  const currentUserRank = currentUser
    ? sortedLeaderboard.findIndex((entry) => entry.isCurrentUser) + 1
    : null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1)
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (rank === 2) return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    if (rank === 3) return "bg-amber-600/20 text-amber-400 border-amber-600/30";
    if (rank <= 10) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-gray-600/20 text-gray-400 border-gray-600/30";
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
      <TraineeLayout currentPage="rankings">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-600 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </TraineeLayout>
    );
  }

  if (error) {
    return (
      <TraineeLayout currentPage="rankings">
        <div className="space-y-6">
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Failed to Load Rankings
            </h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button
              onClick={fetchLeaderboard}
              className="bg-[#00cfb6] text-slate-900 hover:bg-[#00cfb6]/90"
            >
              Try Again
            </Button>
          </div>
        </div>
      </TraineeLayout>
    );
  }

  return (
    <TraineeLayout currentPage="rankings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Trophy className="w-8 h-8 mr-3 text-[#00cfb6]" />
              Class Rankings
            </h1>
            <p className="text-gray-300">
              See how you rank among your fellow trainees in your mentor&apos;s
              program
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortBy === "bestScore" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("bestScore")}
              className={
                sortBy === "bestScore"
                  ? "bg-[#00cfb6] text-slate-900"
                  : "border-white/20 text-white hover:bg-white/10"
              }
            >
              Best Score
            </Button>
            <Button
              variant={sortBy === "averageScore" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("averageScore")}
              className={
                sortBy === "averageScore"
                  ? "bg-[#00cfb6] text-slate-900"
                  : "border-white/20 text-white hover:bg-white/10"
              }
            >
              Average
            </Button>
            <Button
              variant={sortBy === "totalAttempts" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("totalAttempts")}
              className={
                sortBy === "totalAttempts"
                  ? "bg-[#00cfb6] text-slate-900"
                  : "border-white/20 text-white hover:bg-white/10"
              }
            >
              Attempts
            </Button>
            <Button
              variant={sortBy === "improvementRate" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSortBy("improvementRate")}
              className={
                sortBy === "improvementRate"
                  ? "bg-[#00cfb6] text-slate-900"
                  : "border-white/20 text-white hover:bg-white/10"
              }
            >
              Improvement
            </Button>
          </div>
        </div>

        {/* Current User Rank Highlight */}
        {currentUser && (
          <Card className="bg-gradient-to-r from-[#00cfb6]/20 to-blue-500/20 border border-[#00cfb6]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-6 h-6 text-[#00cfb6]" />
                    <span className="text-white font-bold text-lg">
                      Your Rank
                    </span>
                  </div>
                  <Badge className="bg-[#00cfb6]/20 text-[#00cfb6] border-[#00cfb6]/30 text-lg px-3 py-1">
                    #{currentUserRank}
                  </Badge>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${getScoreColor(
                      currentUser.bestScore
                    )}`}
                  >
                    {currentUser.bestScore}
                  </p>
                  <p className="text-gray-300 text-sm">Best Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {sortedLeaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
            <Card
              className={`bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 order-2 md:order-1 ${
                sortedLeaderboard[1].isCurrentUser
                  ? "ring-2 ring-[#00cfb6]"
                  : ""
              }`}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Medal className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {sortedLeaderboard[1].trainee.name}
                  {sortedLeaderboard[1].isCurrentUser && (
                    <span className="text-[#00cfb6] ml-2">(You)</span>
                  )}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {sortedLeaderboard[1].trainee.institution}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Best Score:</span>
                    <span
                      className={`font-bold ${getScoreColor(
                        sortedLeaderboard[1].bestScore
                      )}`}
                    >
                      {sortedLeaderboard[1].bestScore}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Attempts:</span>
                    <span className="text-white">
                      {sortedLeaderboard[1].totalAttempts}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card
              className={`bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 order-1 md:order-2 transform md:scale-105 ${
                sortedLeaderboard[0].isCurrentUser
                  ? "ring-2 ring-[#00cfb6]"
                  : ""
              }`}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Trophy className="w-16 h-16 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {sortedLeaderboard[0].trainee.name}
                  {sortedLeaderboard[0].isCurrentUser && (
                    <span className="text-[#00cfb6] ml-2">(You)</span>
                  )}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {sortedLeaderboard[0].trainee.institution}
                </p>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-3">
                  Champion
                </Badge>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Best Score:</span>
                    <span
                      className={`font-bold ${getScoreColor(
                        sortedLeaderboard[0].bestScore
                      )}`}
                    >
                      {sortedLeaderboard[0].bestScore}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Attempts:</span>
                    <span className="text-white">
                      {sortedLeaderboard[0].totalAttempts}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card
              className={`bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-600/30 order-3 ${
                sortedLeaderboard[2].isCurrentUser
                  ? "ring-2 ring-[#00cfb6]"
                  : ""
              }`}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Award className="w-12 h-12 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {sortedLeaderboard[2].trainee.name}
                  {sortedLeaderboard[2].isCurrentUser && (
                    <span className="text-[#00cfb6] ml-2">(You)</span>
                  )}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {sortedLeaderboard[2].trainee.institution}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Best Score:</span>
                    <span
                      className={`font-bold ${getScoreColor(
                        sortedLeaderboard[2].bestScore
                      )}`}
                    >
                      {sortedLeaderboard[2].bestScore}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Attempts:</span>
                    <span className="text-white">
                      {sortedLeaderboard[2].totalAttempts}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#00cfb6]" />
              Complete Rankings ({leaderboard.length} trainees)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedLeaderboard.length > 0 ? (
              <div className="space-y-3">
                {sortedLeaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:bg-white/5 ${
                      entry.isCurrentUser
                        ? "bg-[#00cfb6]/10 border border-[#00cfb6]/30"
                        : index < 3
                        ? "bg-white/10 border border-white/20"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Rank */}
                      <div className="flex items-center space-x-3">
                        {getRankIcon(index + 1)}
                        <Badge className={getRankBadgeColor(index + 1)}>
                          #{index + 1}
                        </Badge>
                      </div>

                      {/* Trainee Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">
                          {entry.trainee.name}
                          {entry.isCurrentUser && (
                            <span className="text-[#00cfb6] ml-2 font-bold">
                              (You)
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="truncate">
                            {entry.trainee.institution}
                          </span>
                          {entry.trainee.graduationYear && (
                            <span>Class of {entry.trainee.graduationYear}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-sm">
                      {/* Best Score */}
                      <div className="text-center">
                        <p
                          className={`font-bold ${getScoreColor(
                            entry.bestScore
                          )}`}
                        >
                          {entry.bestScore}
                        </p>
                        <p className="text-gray-400">Best</p>
                      </div>

                      {/* Average Score */}
                      <div className="text-center">
                        <p
                          className={`font-bold ${getScoreColor(
                            entry.averageScore
                          )}`}
                        >
                          {entry.averageScore}
                        </p>
                        <p className="text-gray-400">Avg</p>
                      </div>

                      {/* Attempts */}
                      <div className="text-center">
                        <p className="text-white font-bold">
                          {entry.totalAttempts}
                        </p>
                        <p className="text-gray-400">Attempts</p>
                      </div>

                      {/* Training Time */}
                      <div className="text-center">
                        <p className="text-white font-bold">
                          {Math.round(entry.totalTrainingTime / 3600)}h
                        </p>
                        <p className="text-gray-400">Time</p>
                      </div>

                      {/* Improvement Rate */}
                      <div className="text-center">
                        <div className="flex items-center">
                          <TrendingUp
                            className={`w-4 h-4 mr-1 ${getImprovementColor(
                              entry.improvementRate
                            )}`}
                          />
                          <span
                            className={`font-bold ${getImprovementColor(
                              entry.improvementRate
                            )}`}
                          >
                            {entry.improvementRate > 0 ? "+" : ""}
                            {entry.improvementRate.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-gray-400">Growth</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Rankings Available
                </h3>
                <p className="text-gray-400">
                  Complete surgery attempts to appear in rankings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        {leaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {Math.max(
                    ...leaderboard.map((e) =>
                      Number.parseInt(e.bestScore.replace("%", ""))
                    )
                  )}
                  %
                </p>
                <p className="text-gray-400 text-sm">Highest Score</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {(
                    leaderboard.reduce(
                      (sum, e) =>
                        sum + Number.parseInt(e.averageScore.replace("%", "")),
                      0
                    ) / leaderboard.length
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-gray-400 text-sm">Class Average</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {leaderboard.reduce((sum, e) => sum + e.totalAttempts, 0)}
                </p>
                <p className="text-gray-400 text-sm">Total Attempts</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {Math.round(
                    leaderboard.reduce(
                      (sum, e) => sum + e.totalTrainingTime,
                      0
                    ) / 3600
                  )}
                  h
                </p>
                <p className="text-gray-400 text-sm">Total Training</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TraineeLayout>
  );
}
