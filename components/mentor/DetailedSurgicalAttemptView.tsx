"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  ArrowLeft,
  Eye,
  Activity,
  Target,
  Scissors,
  Wrench,
  Navigation,
  Lock,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";
import SlidingDialog from "@/components/ui/sliding-dialog";
import FeedbackForm from "./FeedbackForm";

interface DetailedSurgicalAttemptViewProps {
  attempt: {
    id: string;
    attemptDate: string;
    totalTime: number;
    score: string;
    isCompleted: boolean;

    // Reduction phase
    reductionDuration?: number;
    reductionNeededBoneLength?: number;
    reductionActualBoneLength?: number;
    reductionAccuracy?: number;
    reductionBeforeXrayImg?: string;
    reductionAfterXrayImg?: string;

    // Entry site and cutting
    entrySiteDuration?: number;
    cuttingScreenshotImg?: string;
    cuttingAccuracy?: number;
    neededThandleDepth?: number;
    actualThandleDepth?: number;
    tHandleAccuracy?: number;

    // Guide wire and nail insertion
    nailInsertionDuration?: number;
    guideWireXrayImg?: string;
    nailXrayImg?: string;
    neededWireDepth?: number;
    actualWireDepth?: number;
    wirePositionAccuracy?: number;
    neededNailDepth?: number;
    actualNailDepth?: number;
    nailPositionAccuracy?: number;

    // Locking and closure
    lockingClosureDuration?: number;
    stepsAccuracy?: number;

    // Tool usage and steps
    toolUsageOrder?: string[];
    stepToolAccuracy?: any;
    nailLockingSteps?: any;

    // Screw positioning
    firstProximalScrewAccuracy?: number;
    secondProximalScrewAccuracy?: number;
    distalScrewAccuracy?: number;

    // X-ray images
    firstProximalLockingXray?: string;
    secondProximalLockingXray?: string;
    distalLockingXrayTopView?: string;
    distalLockingXraySideView?: string;

    // Legacy
    xrayImagePath?: string;
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
  };
  traineeId: string;
  onBack: () => void;
  onFeedbackSubmitted?: () => void;
}

const DetailedSurgicalAttemptView = ({
  attempt,
  traineeId,
  onBack,
  onFeedbackSubmitted,
}: DetailedSurgicalAttemptViewProps) => {
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  const getAccuracyBadge = (accuracy?: number) => {
    if (accuracy === undefined || accuracy === null) return null;

    const color =
      accuracy >= 80
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : accuracy >= 60
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-red-500/20 text-red-400 border-red-500/30";

    return <Badge className={color}>{accuracy.toFixed(1)}%</Badge>;
  };

  const phaseData = [
    {
      title: "Reduction Phase",
      icon: Target,
      duration: attempt.reductionDuration,
      accuracy: attempt.reductionAccuracy,
      details: [
        {
          label: "Needed Bone Length",
          value: attempt.reductionNeededBoneLength?.toFixed(2),
        },
        {
          label: "Actual Bone Length",
          value: attempt.reductionActualBoneLength?.toFixed(2),
        },
      ],
      images: [
        { label: "Before Reduction", path: attempt.reductionBeforeXrayImg },
        { label: "After Reduction", path: attempt.reductionAfterXrayImg },
      ],
    },
    {
      title: "Entry Site & Cutting",
      icon: Scissors,
      duration: attempt.entrySiteDuration,
      accuracy: attempt.cuttingAccuracy,
      details: [
        {
          label: "Needed T-Handle Depth",
          value: attempt.neededThandleDepth?.toFixed(2),
        },
        {
          label: "Actual T-Handle Depth",
          value: attempt.actualThandleDepth?.toFixed(2),
        },
        {
          label: "T-Handle Accuracy",
          value: attempt.tHandleAccuracy?.toFixed(1) + "%",
        },
      ],
      images: [
        { label: "Cutting Screenshot", path: attempt.cuttingScreenshotImg },
      ],
    },
    {
      title: "Guide Wire & Nail Insertion",
      icon: Navigation,
      duration: attempt.nailInsertionDuration,
      accuracy: attempt.wirePositionAccuracy,
      details: [
        {
          label: "Needed Wire Depth",
          value: attempt.neededWireDepth?.toFixed(2),
        },
        {
          label: "Actual Wire Depth",
          value: attempt.actualWireDepth?.toFixed(2),
        },
        {
          label: "Needed Nail Depth",
          value: attempt.neededNailDepth?.toFixed(2),
        },
        {
          label: "Actual Nail Depth",
          value: attempt.actualNailDepth?.toFixed(2),
        },
        {
          label: "Nail Position Accuracy",
          value: attempt.nailPositionAccuracy?.toFixed(1) + "%",
        },
      ],
      images: [
        { label: "Guide Wire X-ray", path: attempt.guideWireXrayImg },
        { label: "Nail X-ray", path: attempt.nailXrayImg },
      ],
    },
    {
      title: "Locking & Closure",
      icon: Lock,
      duration: attempt.lockingClosureDuration,
      accuracy: attempt.stepsAccuracy,
      details: [
        {
          label: "First Proximal Screw",
          value: attempt.firstProximalScrewAccuracy?.toFixed(1) + "%",
        },
        {
          label: "Second Proximal Screw",
          value: attempt.secondProximalScrewAccuracy?.toFixed(1) + "%",
        },
        {
          label: "Distal Screw",
          value: attempt.distalScrewAccuracy?.toFixed(1) + "%",
        },
      ],
      images: [
        {
          label: "First Proximal Locking",
          path: attempt.firstProximalLockingXray,
        },
        {
          label: "Second Proximal Locking",
          path: attempt.secondProximalLockingXray,
        },
        {
          label: "Distal Locking (Top)",
          path: attempt.distalLockingXrayTopView,
        },
        {
          label: "Distal Locking (Side)",
          path: attempt.distalLockingXraySideView,
        },
      ],
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-gray-400 hover:text-white shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Detailed Surgical Analysis
            </h3>
            <p className="text-sm text-gray-400">
              Attempt #{attempt.id.slice(-8)} •{" "}
              {formatDate(attempt.attemptDate)}
            </p>
          </div>
        </div>
        <Badge
          className={`text-lg font-bold ${getScoreColor(
            attempt.score
          )} bg-white/10 border-white/20`}
        >
          {attempt.score}
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#00cfb6] data-[state=active]:text-slate-900 text-xs"
          >
            <Activity className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="phases"
            className="data-[state=active]:bg-[#00cfb6] data-[state=active]:text-slate-900 text-xs"
          >
            <Target className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Phases</span>
          </TabsTrigger>
          <TabsTrigger
            value="tools"
            className="data-[state=active]:bg-[#00cfb6] data-[state=active]:text-slate-900 text-xs"
          >
            <Wrench className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Tools</span>
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="data-[state=active]:bg-[#00cfb6] data-[state=active]:text-slate-900 text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Feedback</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">
                  {formatTime(attempt.totalTime)}
                </p>
                <p className="text-xs text-gray-400">Total Time</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-4 text-center">
                {attempt.isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                )}
                <p className="text-lg font-bold text-white">
                  {attempt.isCompleted ? "Complete" : "Incomplete"}
                </p>
                <p className="text-xs text-gray-400">Status</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-6 h-6 text-[#00cfb6] mx-auto mb-2" />
                <p className="text-lg font-bold text-white">
                  {attempt.feedbacks.length}
                </p>
                <p className="text-xs text-gray-400">Feedback Items</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">
                  {attempt.feedbacks.filter((f) => f.rating).length > 0
                    ? (
                        attempt.feedbacks.reduce(
                          (sum, f) => sum + (f.rating || 0),
                          0
                        ) / attempt.feedbacks.filter((f) => f.rating).length
                      ).toFixed(1)
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-400">Avg Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Phase Summary */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Phase Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {phaseData.map((phase, index) => {
                  const Icon = phase.icon;
                  return (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-[#00cfb6]" />
                          <span className="text-white font-medium text-sm">
                            {phase.title}
                          </span>
                        </div>
                        {getAccuracyBadge(phase.accuracy)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Duration: {formatTime(phase.duration)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phases Tab */}
        <TabsContent value="phases" className="mt-4 space-y-4">
          {phaseData.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center text-base">
                      <Icon className="w-5 h-5 mr-2 text-[#00cfb6]" />
                      {phase.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getAccuracyBadge(phase.accuracy)}
                      <Badge
                        variant="outline"
                        className="border-white/20 text-white text-xs"
                      >
                        {formatTime(phase.duration)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Details */}
                  {phase.details.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {phase.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          className="bg-white/5 rounded-lg p-3"
                        >
                          <p className="text-xs text-gray-400">
                            {detail.label}
                          </p>
                          <p className="text-sm text-white font-medium">
                            {detail.value || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Images */}
                  {phase.images.some((img) => img.path) && (
                    <div>
                      <h5 className="text-white font-medium mb-2 text-sm">
                        Associated Images
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {phase.images
                          .filter((img) => img.path)
                          .map((image, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="bg-white/5 rounded-lg p-3 text-center"
                            >
                              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-300">
                                {image.label}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 border-white/20 text-white hover:bg-white/10 text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="mt-4 space-y-4">
          {/* Tool Usage Order */}
          {attempt.toolUsageOrder && attempt.toolUsageOrder.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  Tool Usage Sequence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {attempt.toolUsageOrder.map((tool, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-[#00cfb6]/30 text-[#00cfb6]"
                    >
                      {index + 1}. {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step Tool Accuracy */}
          {attempt.stepToolAccuracy && (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  Tool Accuracy Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(attempt.stepToolAccuracy).map(
                    ([tool, accuracy]) => (
                      <div
                        key={tool}
                        className="bg-white/5 rounded-lg p-3 text-center"
                      >
                        <p className="text-sm text-white font-medium">{tool}</p>
                        <Badge
                          className={
                            accuracy
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {accuracy ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nail Locking Steps */}
          {attempt.nailLockingSteps && (
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Nail Locking Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(attempt.nailLockingSteps).map(
                    ([step, data]: [string, any]) => (
                      <div
                        key={step}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                      >
                        <span className="text-white text-sm">{step}</span>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="border-white/20 text-white text-xs"
                          >
                            Step {data.stepOrder}
                          </Badge>
                          <Badge
                            className={
                              data.isDone
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {data.isDone ? "Done" : "Skipped"}
                          </Badge>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="mt-4">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-[#00cfb6]" />
                  Mentor Feedback ({attempt.feedbacks.length})
                </CardTitle>
                <Button
                  onClick={() => setIsFeedbackDialogOpen(true)}
                  size="sm"
                  className="bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Feedback
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {attempt.feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {attempt.feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="bg-white/5 rounded-lg p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <p className="text-white font-medium">
                            {feedback.mentor.user.name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(feedback.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        {feedback.rating && (
                          <div className="flex items-center bg-yellow-500/20 rounded-full px-3 py-1">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-yellow-400 font-medium">
                              {feedback.rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {feedback.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No feedback provided yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Be the first to provide feedback on this attempt
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <SlidingDialog
        title="Provide Feedback"
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
      >
        <FeedbackForm
          attemptId={attempt.id}
          traineeId={traineeId}
          onClose={() => setIsFeedbackDialogOpen(false)}
          onFeedbackSubmitted={() => {
            onFeedbackSubmitted?.();
            setIsFeedbackDialogOpen(false);
          }}
          existingFeedbacks={attempt.feedbacks}
        />
      </SlidingDialog>
    </div>
  );
};

export default DetailedSurgicalAttemptView;
