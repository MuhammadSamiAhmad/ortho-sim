"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  MessageSquare,
  Eye,
  Star,
  ChevronRight,
  Activity,
  Target,
  Scissors,
  Zap,
} from "lucide-react";
import { useState } from "react";
import SlidingDialog from "@/components/ui/sliding-dialog";
import FeedbackForm from "./FeedbackForm";

interface SurgicalAttemptCardProps {
  attempt: {
    id: string;
    attemptDate: string;
    totalTime: number;
    score: string;
    isCompleted: boolean;
    xrayImagePath?: string;

    // Detailed metrics
    reductionAccuracy?: number | null;
    cuttingAccuracy?: number | null;
    wirePositionAccuracy?: number | null;
    nailPositionAccuracy?: number | null;
    stepsAccuracy?: number | null;
    firstProximalScrewAccuracy?: number | null;
    secondProximalScrewAccuracy?: number | null;
    distalScrewAccuracy?: number | null;

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
  };
  traineeId?: string;
  onClick?: () => void;
  showDetailedMetrics?: boolean;
}

const SurgicalAttemptCard = ({
  attempt,
  traineeId,
  onClick,
  showDetailedMetrics = false,
}: SurgicalAttemptCardProps) => {
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

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

  const hasFeedback = attempt.feedbacks.length > 0;

  return (
    <>
      <Card
        className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Badge
                  variant={attempt.isCompleted ? "default" : "secondary"}
                  className={`text-xs ${
                    attempt.isCompleted
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }`}
                >
                  {attempt.isCompleted ? "Completed" : "In Progress"}
                </Badge>
                <span
                  className={`text-xl font-bold ${getScoreColor(
                    attempt.score
                  )}`}
                >
                  {attempt.score}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-400 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="truncate">
                    {formatDate(attempt.attemptDate)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatTime(attempt.totalTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {hasFeedback && (
                <Badge className="bg-[#00cfb6]/20 text-[#00cfb6] border-[#00cfb6]/30 text-xs">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {attempt.feedbacks.length}
                </Badge>
              )}
              {onClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Detailed Metrics */}
          {showDetailedMetrics && (
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {attempt.reductionAccuracy !== undefined && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Activity className="w-3 h-3 text-blue-400 mr-1" />
                    </div>
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
                    <div className="flex items-center justify-center mb-1">
                      <Scissors className="w-3 h-3 text-purple-400 mr-1" />
                    </div>
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
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="w-3 h-3 text-yellow-400 mr-1" />
                    </div>
                    <p
                      className={`text-sm font-bold ${getAccuracyColor(
                        attempt.wirePositionAccuracy
                      )}`}
                    >
                      {formatAccuracy(attempt.wirePositionAccuracy)}
                    </p>
                    <p className="text-xs text-gray-400">Wire</p>
                  </div>
                )}

                {attempt.nailPositionAccuracy !== undefined && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="w-3 h-3 text-green-400 mr-1" />
                    </div>
                    <p
                      className={`text-sm font-bold ${getAccuracyColor(
                        attempt.nailPositionAccuracy
                      )}`}
                    >
                      {formatAccuracy(attempt.nailPositionAccuracy)}
                    </p>
                    <p className="text-xs text-gray-400">Nail</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Existing Feedback Preview */}
          {hasFeedback && (
            <div className="mb-4 space-y-2">
              <h4 className="text-white font-medium text-sm">
                Latest Feedback:
              </h4>
              {attempt.feedbacks.slice(0, 1).map((feedback) => (
                <div key={feedback.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <span className="text-gray-300 text-sm font-medium">
                      {feedback.mentor.user.name}
                    </span>
                    {feedback.rating && (
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        <span className="text-yellow-400 text-xs">
                          {feedback.rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {feedback.comment}
                  </p>
                </div>
              ))}
              {attempt.feedbacks.length > 1 && (
                <p className="text-gray-500 text-xs">
                  +{attempt.feedbacks.length - 1} more feedback(s)
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {traineeId && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFeedbackDialogOpen(true);
                }}
                className="flex-1 bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {hasFeedback ? "Add Feedback" : "Give Feedback"}
              </Button>
              {attempt.xrayImagePath && (
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-3"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {traineeId && (
        <SlidingDialog
          title="Provide Feedback"
          open={isFeedbackDialogOpen}
          onOpenChange={setIsFeedbackDialogOpen}
        >
          <FeedbackForm
            attemptId={attempt.id}
            traineeId={traineeId}
            onClose={() => setIsFeedbackDialogOpen(false)}
            existingFeedbacks={attempt.feedbacks}
          />
        </SlidingDialog>
      )}
    </>
  );
};

export default SurgicalAttemptCard;
