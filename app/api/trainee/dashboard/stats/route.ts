import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get trainee profile
    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        surgeryAttempts: true,
        leaderboard: true,
        mentor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!traineeProfile) {
      return NextResponse.json(
        { error: "Trainee profile not found" },
        { status: 404 }
      );
    }

    console.log("Trainee profile mentor data:", {
      mentorExists: !!traineeProfile.mentor,
      mentorUser: traineeProfile.mentor?.user,
      mentorName: traineeProfile.mentor?.user?.name,
    });

    // Calculate statistics
    const allAttempts = traineeProfile.surgeryAttempts;
    const completedAttempts = allAttempts.filter(
      (attempt) => attempt.isCompleted
    );

    // Calculate scores
    const scores = completedAttempts
      .map((attempt) => Number.parseInt(attempt.score.replace("%", "")))
      .filter((score) => !isNaN(score));

    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Calculate total training time
    const totalTrainingTime = allAttempts.reduce(
      (sum, attempt) => sum + attempt.totalTime,
      0
    );

    // Calculate improvement rate (comparing first 3 vs last 3 attempts)
    let improvementRate = 0;
    if (scores.length >= 6) {
      const firstThree = scores.slice(0, 3);
      const lastThree = scores.slice(-3);
      const firstAvg =
        firstThree.reduce((sum, score) => sum + score, 0) / firstThree.length;
      const lastAvg =
        lastThree.reduce((sum, score) => sum + score, 0) / lastThree.length;
      improvementRate = ((lastAvg - firstAvg) / firstAvg) * 100;
    }

    // Get feedback count
    const feedbackReceived = await prisma.feedback.count({
      where: {
        surgeryAttempt: {
          traineeProfileId: traineeProfile.id,
        },
      },
    });

    const stats = {
      totalAttempts: allAttempts.length,
      completedAttempts: completedAttempts.length,
      averageScore: Math.round(averageScore),
      bestScore,
      totalTrainingHours: Math.round(totalTrainingTime / 3600),
      improvementRate: Math.round(improvementRate),
      feedbackReceived,
      currentRank: traineeProfile.leaderboard?.rank || null,
      mentorName: traineeProfile.mentor?.user?.name || null,
    };

    console.log("Dashboard stats response:", stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Trainee dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
