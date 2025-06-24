import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!mentorProfile) {
      return NextResponse.json(
        { error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    // Get all trainees for this mentor
    const trainees = await prisma.traineeProfile.findMany({
      where: { mentorId: mentorProfile.id },
      include: {
        surgeryAttempts: true,
        leaderboard: true,
      },
    });

    // Calculate statistics
    const totalTrainees = trainees.length;
    const activeTrainees = trainees.filter(
      (trainee) => trainee.surgeryAttempts.length > 0
    ).length;

    const allAttempts = trainees.flatMap((trainee) => trainee.surgeryAttempts);
    const totalAttempts = allAttempts.length;
    const completedAttempts = allAttempts.filter(
      (attempt) => attempt.isCompleted
    );

    // Calculate average score
    const scores = completedAttempts
      .map((attempt) => Number.parseInt(attempt.score.replace("%", "")))
      .filter((score) => !isNaN(score));

    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    // Calculate total training hours
    const totalTrainingTime = allAttempts.reduce(
      (sum, attempt) => sum + attempt.totalTime,
      0
    );
    const totalTrainingHours = Math.round(totalTrainingTime / 3600);

    // Get feedback count
    const feedbackGiven = await prisma.feedback.count({
      where: { mentorProfileId: mentorProfile.id },
    });

    const stats = {
      totalTrainees,
      activeTrainees,
      totalAttempts,
      averageScore,
      totalTrainingHours,
      feedbackGiven,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
