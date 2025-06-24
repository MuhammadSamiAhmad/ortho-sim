"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";

const FeedbackSchema = z.object({
  comment: z.string().min(10, "Feedback must be at least 10 characters"),
  rating: z.number().min(1).max(5).optional(),
});

type FeedbackData = z.infer<typeof FeedbackSchema>;

interface FeedbackFormProps {
  attemptId: string;
  traineeId: string;
  onClose: () => void;
  onFeedbackSubmitted?: () => void;
  existingFeedbacks: Array<{
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

const FeedbackForm = ({
  attemptId,
  onClose,
  onFeedbackSubmitted,
  existingFeedbacks,
}: FeedbackFormProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackData>({
    resolver: zodResolver(FeedbackSchema),
    defaultValues: {
      comment: "",
      rating: undefined,
    },
  });

  const onSubmit = async (data: FeedbackData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          rating: rating || undefined,
          surgeryAttemptId: attemptId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      // Reset form
      form.reset();
      setRating(0);

      // Call callbacks
      onFeedbackSubmitted?.();
      onClose();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Feedback */}
      {existingFeedbacks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-white font-medium">Previous Feedback</h3>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {existingFeedbacks.map((feedback) => (
              <Card
                key={feedback.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm font-medium">
                      {feedback.mentor.user.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      {feedback.rating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-yellow-400 text-sm">
                            {feedback.rating}/5
                          </span>
                        </div>
                      )}
                      <span className="text-gray-500 text-xs">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{feedback.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New Feedback Form */}
      <div className="space-y-4">
        <h3 className="text-white font-medium">Add New Feedback</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Rating (Optional)
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-gray-300 text-sm">{rating}/5</span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Feedback Comment
            </label>
            <Textarea
              {...form.register("comment")}
              placeholder="Provide detailed feedback on the trainee's performance..."
              className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00cfb6] focus:ring-[#00cfb6]"
            />
            {form.formState.errors.comment && (
              <p className="text-red-400 text-sm">
                {form.formState.errors.comment.message}
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#00cfb6] hover:bg-[#00cfb6]/90 text-slate-900 font-medium"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
