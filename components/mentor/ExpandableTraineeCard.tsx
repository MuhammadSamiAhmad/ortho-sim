"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Calendar,
  Building,
  Eye,
  Minimize2,
  Maximize2,
  Activity,
  BarChart3,
} from "lucide-react";
import SurgicalAttemptCard from "./SurgicalAttemptCard";
import DetailedSurgicalAttemptView from "./DetailedSurgicalAttemptView";
import gsap from "gsap";

interface ExpandableTraineeCardProps {
  trainee: {
    id: string;
    user: {
      name: string;
      email: string;
      profileImage?: string;
    };
    institution?: string;
    graduationYear?: number;
    totalAttempts: number;
    averageScore: string;
    lastActivity: string;
    status: "active" | "inactive";
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ExpandableTraineeCard = ({
  trainee,
  isExpanded,
  onToggleExpand,
}: ExpandableTraineeCardProps) => {
  const [surgicalAttempts, setSurgicalAttempts] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);

  // Fetch surgical attempts when expanded
  useEffect(() => {
    if (isExpanded && surgicalAttempts.length === 0) {
      fetchSurgicalAttempts();
    }
  }, [isExpanded]);

  const fetchSurgicalAttempts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/mentor/trainees/${trainee.id}/attempts`
      );
      if (response.ok) {
        const data = await response.json();
        setSurgicalAttempts(data);
      }
    } catch (error) {
      console.error("Failed to fetch surgical attempts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation for expansion
  useEffect(() => {
    if (!cardRef.current) return;

    if (isExpanded) {
      gsap.to(cardRef.current, {
        scale: 1.01,
        duration: 0.3,
        ease: "power2.out",
      });

      if (expandedContentRef.current) {
        gsap.fromTo(
          expandedContentRef.current,
          { opacity: 0, height: 0 },
          {
            opacity: 1,
            height: "auto",
            duration: 0.4,
            ease: "power2.out",
            delay: 0.1,
          }
        );
      }
    } else {
      gsap.to(cardRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      // Reset states when collapsed
      setSelectedTab("overview");
      setSelectedAttemptId(null);
    }
  }, [isExpanded]);

  const handleAttemptClick = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setSelectedTab("overview");
  };

  const handleBackToOverview = () => {
    setSelectedAttemptId(null);
  };

  const getPerformanceStats = () => {
    if (surgicalAttempts.length === 0) return null;

    const completedAttempts = surgicalAttempts.filter((a) => a.isCompleted);
    const scores = completedAttempts.map((a) =>
      Number.parseInt(a.score.replace("%", ""))
    );
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const totalTime = surgicalAttempts.reduce((acc, a) => acc + a.totalTime, 0);

    return {
      totalAttempts: surgicalAttempts.length,
      completedAttempts: completedAttempts.length,
      averageScore: avgScore.toFixed(0),
      bestScore,
      totalTrainingTime: Math.round(totalTime / 3600), // Convert to hours
    };
  };

  const selectedAttempt = selectedAttemptId
    ? surgicalAttempts.find((a) => a.id === selectedAttemptId)
    : null;

  const stats = getPerformanceStats();

  return (
    <div className={`${isExpanded ? "col-span-full" : ""}`}>
      <Card
        ref={cardRef}
        className={`bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 ${
          isExpanded ? "border-[#00cfb6]/50" : ""
        }`}
      >
        <CardContent className="p-4 sm:p-6">
          {/* Compact View Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00cfb6] rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                  {trainee.user.name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm truncate">
                  {trainee.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Badge
                variant={trainee.status === "active" ? "default" : "secondary"}
                className={`text-xs ${
                  trainee.status === "active"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }`}
              >
                {trainee.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleExpand}
                className="text-gray-400 hover:text-white h-8 w-8 sm:h-10 sm:w-10"
              >
                {isExpanded ? (
                  <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Institution and Graduation Info */}
          <div className="space-y-3 mb-4">
            {trainee.institution && (
              <div className="flex items-center text-gray-300 text-xs sm:text-sm">
                <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 shrink-0" />
                <span className="truncate">{trainee.institution}</span>
              </div>
            )}
            {trainee.graduationYear && (
              <div className="flex items-center text-gray-300 text-xs sm:text-sm">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 shrink-0" />
                <span>Graduating {trainee.graduationYear}</span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-[#00cfb6]">
                {trainee.totalAttempts}
              </p>
              <p className="text-xs text-gray-400">Attempts</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-[#00cfb6]">
                {trainee.averageScore}
              </p>
              <p className="text-xs text-gray-400">Avg Score</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-300 truncate">
                {trainee.lastActivity}
              </p>
              <p className="text-xs text-gray-400">Last Active</p>
            </div>
          </div>

          {/* View Details Button (when collapsed) */}
          {!isExpanded && (
            <Button
              onClick={onToggleExpand}
              className="w-full bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium text-sm"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              View Details
            </Button>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <div ref={expandedContentRef} className="mt-6">
              {selectedAttempt ? (
                <DetailedSurgicalAttemptView
                  attempt={selectedAttempt}
                  traineeId={trainee.id}
                  onBack={handleBackToOverview}
                  onFeedbackSubmitted={fetchSurgicalAttempts}
                />
              ) : (
                <Tabs
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-[#00cfb6] data-[state=active]:text-slate-900 text-xs sm:text-sm"
                    >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Overview</span>
                      <span className="sm:hidden">Stats</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="attempts"
                      className="data-[state=active]:bg-[#00cfb6] data-[state=active]:text-slate-900 text-xs sm:text-sm"
                    >
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">All Attempts</span>
                      <span className="sm:hidden">Attempts</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="overview"
                    className="mt-4 sm:mt-6 space-y-4"
                  >
                    {stats && (
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div className="bg-white/5 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-lg sm:text-2xl font-bold text-[#00cfb6]">
                            {stats.totalAttempts}
                          </p>
                          <p className="text-xs text-gray-400">Total</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-lg sm:text-2xl font-bold text-[#00cfb6]">
                            {stats.completedAttempts}
                          </p>
                          <p className="text-xs text-gray-400">Completed</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-lg sm:text-2xl font-bold text-[#00cfb6]">
                            {stats.averageScore}%
                          </p>
                          <p className="text-xs text-gray-400">Avg Score</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-lg sm:text-2xl font-bold text-[#00cfb6]">
                            {stats.bestScore}%
                          </p>
                          <p className="text-xs text-gray-400">Best Score</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 sm:p-4 text-center">
                          <p className="text-lg sm:text-2xl font-bold text-[#00cfb6]">
                            {stats.totalTrainingTime}h
                          </p>
                          <p className="text-xs text-gray-400">Training</p>
                        </div>
                      </div>
                    )}

                    {/* Recent Attempts Preview */}
                    <div className="space-y-3">
                      <h4 className="text-white font-medium text-sm sm:text-base">
                        Recent Attempts
                      </h4>
                      {surgicalAttempts.slice(0, 3).map((attempt) => (
                        <div
                          key={attempt.id}
                          onClick={() => handleAttemptClick(attempt.id)}
                          className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium text-sm sm:text-base">
                                {attempt.score}
                              </p>
                              <p className="text-gray-400 text-xs sm:text-sm">
                                {new Date(
                                  attempt.attemptDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              className={`text-xs ${
                                Number.parseInt(
                                  attempt.score.replace("%", "")
                                ) >= 80
                                  ? "bg-green-500/20 text-green-400"
                                  : Number.parseInt(
                                      attempt.score.replace("%", "")
                                    ) >= 60
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {attempt.isCompleted
                                ? "Completed"
                                : "In Progress"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="attempts"
                    className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
                  >
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-[#00cfb6]/30 border-t-[#00cfb6] rounded-full animate-spin mx-auto" />
                      </div>
                    ) : surgicalAttempts.length > 0 ? (
                      surgicalAttempts.map((attempt) => (
                        <SurgicalAttemptCard
                          key={attempt.id}
                          attempt={attempt}
                          traineeId={trainee.id}
                          onClick={() => handleAttemptClick(attempt.id)}
                          showDetailedMetrics={true}
                        />
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <p className="text-gray-400 text-sm">
                          No surgical attempts found
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpandableTraineeCard;
