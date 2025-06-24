"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, Clock } from "lucide-react";

interface Feedback {
  id: string;
  comment: string;
  rating?: number;
  createdAt: string;
  mentor: {
    user: {
      name: string;
    };
  };
}

interface FeedbackViewerProps {
  surgeryAttemptId: string;
}

const FeedbackViewer = ({ surgeryAttemptId }: FeedbackViewerProps) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/trainee/feedback?surgeryAttemptId=${surgeryAttemptId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch feedbacks");
        }

        const data = await response.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (surgeryAttemptId) {
      fetchFeedbacks();
    }
  }, [surgeryAttemptId]);

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#00cfb6]/30 border-t-[#00cfb6] rounded-full animate-spin" />
            <span className="ml-2 text-gray-400">Loading feedback...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load feedback</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-[#00cfb6]" />
          Mentor Feedback ({feedbacks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <p className="text-white font-medium">
                      {feedback.mentor.user.name}
                    </p>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <Clock className="w-3 h-3 mr-1" />
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
                    </div>
                  </div>
                  {feedback.rating && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      {feedback.rating}/5
                    </Badge>
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
            <p className="text-gray-400">No feedback available</p>
            <p className="text-gray-500 text-sm mt-1">
              Your mentor hasn&apos;t provided feedback for this attempt yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackViewer;
