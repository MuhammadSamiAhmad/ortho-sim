"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Activity,
  Calendar,
  Clock,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import TraineeLayout from "@/components/trainee/TraineeLayout";
import DetailedSurgicalAttemptView from "@/components/mentor/DetailedSurgicalAttemptView";

interface SurgicalAttempt {
  id: string;
  attemptDate: string;
  totalTime: number;
  score: string;
  isCompleted: boolean;
  xrayImagePath?: string;

  // Detailed metrics
  reductionDuration?: number;
  reductionNeededBoneLength?: number;
  reductionActualBoneLength?: number;
  reductionAccuracy?: number;
  reductionBeforeXrayImg?: string;
  reductionAfterXrayImg?: string;

  entrySiteDuration?: number;
  cuttingScreenshotImg?: string;
  cuttingAccuracy?: number;
  neededThandleDepth?: number;
  actualThandleDepth?: number;
  tHandleAccuracy?: number;

  nailInsertionDuration?: number;
  guideWireXrayImg?: string;
  nailXrayImg?: string;
  neededWireDepth?: number;
  actualWireDepth?: number;
  wirePositionAccuracy?: number;
  neededNailDepth?: number;
  actualNailDepth?: number;
  nailPositionAccuracy?: number;

  lockingClosureDuration?: number;
  stepsAccuracy?: number;

  toolUsageOrder?: string[];
  stepToolAccuracy?: any;
  nailLockingSteps?: any;

  firstProximalScrewAccuracy?: number;
  secondProximalScrewAccuracy?: number;
  distalScrewAccuracy?: number;

  firstProximalLockingXray?: string;
  secondProximalLockingXray?: string;
  distalLockingXrayTopView?: string;
  distalLockingXraySideView?: string;

  performanceDetail?: any;

  feedbacks: Array<{
    id: string;
    comment: string;
    rating?: number;
    createdAt: string;
    mentor: {
      user: {
        name: string;
      };
    };
  }>;
}

export default function TraineeAttemptsPage() {
  const [attempts, setAttempts] = useState<SurgicalAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<SurgicalAttempt[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null
  );
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "incomplete"
  >("all");

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await fetch("/api/trainee/attempts");
      if (response.ok) {
        const data = await response.json();
        setAttempts(data);
        setFilteredAttempts(data);
      }
    } catch (error) {
      console.error("Failed to fetch attempts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter attempts based on search term and status
  useEffect(() => {
    let filtered = attempts;

    // Filter by status
    if (filterStatus === "completed") {
      filtered = filtered.filter((attempt) => attempt.isCompleted);
    } else if (filterStatus === "incomplete") {
      filtered = filtered.filter((attempt) => !attempt.isCompleted);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (attempt) =>
          attempt.score.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(attempt.attemptDate)
            .toLocaleDateString()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAttempts(filtered);
  }, [searchTerm, attempts, filterStatus]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
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

  const getAccuracyColor = (accuracy: number | null | undefined) => {
    if (accuracy === null || accuracy === undefined) return "text-gray-400";
    if (accuracy >= 80) return "text-green-400";
    if (accuracy >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const formatAccuracy = (accuracy: number | null | undefined) => {
    if (accuracy === null || accuracy === undefined) return "N/A";
    return `${accuracy.toFixed(0)}%`;
  };

  const handleAttemptClick = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
  };

  const handleBackToList = () => {
    setSelectedAttemptId(null);
  };

  const handleToggleExpand = (attemptId: string) => {
    setExpandedAttemptId(expandedAttemptId === attemptId ? null : attemptId);
  };

  const selectedAttempt = selectedAttemptId
    ? attempts.find((a) => a.id === selectedAttemptId)
    : null;

  // Calculate statistics
  const completedAttempts = attempts.filter((a) => a.isCompleted);
  const scores = completedAttempts.map((a) =>
    Number.parseInt(a.score.replace("%", ""))
  );
  const averageScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const totalTrainingTime = attempts.reduce((acc, a) => acc + a.totalTime, 0);

  if (isLoading) {
    return (
      <TraineeLayout currentPage="attempts">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-600 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </TraineeLayout>
    );
  }

  if (selectedAttempt) {
    return (
      <TraineeLayout currentPage="attempts">
        <DetailedSurgicalAttemptView
          attempt={selectedAttempt}
          traineeId="" // Not needed for trainee view
          onBack={handleBackToList}
        />
      </TraineeLayout>
    );
  }

  return (
    <TraineeLayout currentPage="attempts">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            My Surgery Attempts
          </h1>
          <p className="text-gray-300">
            Track your surgical training progress and review feedback from your
            mentor
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{attempts.length}</p>
              <p className="text-gray-400 text-sm">Total Attempts</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-[#00cfb6] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {averageScore.toFixed(0)}%
              </p>
              <p className="text-gray-400 text-sm">Average Score</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{bestScore}%</p>
              <p className="text-gray-400 text-sm">Best Score</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.round(totalTrainingTime / 3600)}h
              </p>
              <p className="text-gray-400 text-sm">Training Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by score or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
            />
          </div>
          <Tabs
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as any)}
          >
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#00cfb6] data-[state=active]:text-slate-900"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-[#00cfb6] data-[state=active]:text-slate-900"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="incomplete"
                className="data-[state=active]:bg-[#00cfb6] data-[state=active]:text-slate-900"
              >
                In Progress
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Attempts List */}
        <div className="space-y-4">
          {filteredAttempts.length > 0 ? (
            filteredAttempts.map((attempt) => (
              <Card
                key={attempt.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-4">
                        <Badge
                          className={`${
                            attempt.isCompleted
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {attempt.isCompleted ? "Completed" : "In Progress"}
                        </Badge>
                        <span
                          className={`text-2xl font-bold ${getScoreColor(
                            attempt.score
                          )}`}
                        >
                          {attempt.score}
                        </span>
                        {attempt.feedbacks.length > 0 && (
                          <Badge className="bg-[#00cfb6]/20 text-[#00cfb6] border-[#00cfb6]/30">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {attempt.feedbacks.length} feedback
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(attempt.attemptDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatTime(attempt.totalTime)}</span>
                        </div>
                      </div>

                      {/* Performance Metrics Preview */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {attempt.reductionAccuracy !== undefined && (
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <p
                              className={`text-sm font-bold ${getAccuracyColor(
                                attempt.reductionAccuracy
                              )}`}
                            >
                              {formatAccuracy(attempt.reductionAccuracy)}
                            </p>
                            <p className="text-xs text-gray-400">Reduction</p>
                          </div>
                        )}

                        {attempt.cuttingAccuracy !== undefined && (
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <p
                              className={`text-sm font-bold ${getAccuracyColor(
                                attempt.cuttingAccuracy
                              )}`}
                            >
                              {formatAccuracy(attempt.cuttingAccuracy)}
                            </p>
                            <p className="text-xs text-gray-400">Cutting</p>
                          </div>
                        )}

                        {attempt.wirePositionAccuracy !== undefined && (
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <p
                              className={`text-sm font-bold ${getAccuracyColor(
                                attempt.wirePositionAccuracy
                              )}`}
                            >
                              {formatAccuracy(attempt.wirePositionAccuracy)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Wire Position
                            </p>
                          </div>
                        )}

                        {attempt.nailPositionAccuracy !== undefined && (
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <p
                              className={`text-sm font-bold ${getAccuracyColor(
                                attempt.nailPositionAccuracy
                              )}`}
                            >
                              {formatAccuracy(attempt.nailPositionAccuracy)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Nail Position
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Feedback Preview */}
                      {attempt.feedbacks.length > 0 &&
                        expandedAttemptId !== attempt.id && (
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium text-sm">
                                Latest Feedback:
                              </span>
                              {attempt.feedbacks[0].rating && (
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                  <span className="text-yellow-400 text-xs">
                                    {attempt.feedbacks[0].rating}/5
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {attempt.feedbacks[0].comment}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              - {attempt.feedbacks[0].mentor.user.name}
                            </p>
                          </div>
                        )}

                      {/* Expanded Feedback */}
                      {expandedAttemptId === attempt.id &&
                        attempt.feedbacks.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-white font-medium">
                              All Feedback:
                            </h4>
                            {attempt.feedbacks.map((feedback) => (
                              <div
                                key={feedback.id}
                                className="bg-white/5 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white font-medium">
                                    {feedback.mentor.user.name}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    {feedback.rating && (
                                      <div className="flex items-center bg-yellow-500/20 rounded-full px-2 py-1">
                                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                        <span className="text-yellow-400 text-xs">
                                          {feedback.rating}/5
                                        </span>
                                      </div>
                                    )}
                                    <span className="text-gray-500 text-xs">
                                      {new Date(
                                        feedback.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                  {feedback.comment}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-32">
                      <Button
                        onClick={() => handleAttemptClick(attempt.id)}
                        className="bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>

                      {attempt.feedbacks.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => handleToggleExpand(attempt.id)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          {expandedAttemptId === attempt.id ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Feedback
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show Feedback
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {searchTerm || filterStatus !== "all"
                    ? "No attempts found"
                    : "No surgery attempts yet"}
                </h3>
                <p className="text-gray-400">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search criteria or filters"
                    : "Start your first VR simulation to begin tracking your progress"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TraineeLayout>
  );
}
