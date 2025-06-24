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

    // Get all trainees with their surgery attempts
    const trainees = await prisma.traineeProfile.findMany({
      where: { mentorId: mentorProfile.id },
      include: {
        user: true,
        surgeryAttempts: {
          where: { isCompleted: true },
          orderBy: { attemptDate: "asc" },
        },
        leaderboard: true,
      },
    });

    // Calculate leaderboard data
    const leaderboardData = trainees
      .map((trainee) => {
        const attempts = trainee.surgeryAttempts;
        const scores = attempts
          .map((attempt) => Number.parseInt(attempt.score.replace("%", "")))
          .filter((score) => !isNaN(score));

        if (scores.length === 0) return null;

        const bestScore = Math.max(...scores);
        const averageScore =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const totalTrainingTime = attempts.reduce(
          (sum, attempt) => sum + attempt.totalTime,
          0
        );

        // Calculate improvement rate (comparing first 3 attempts vs last 3 attempts)
        let improvementRate = 0;
        if (scores.length >= 6) {
          const firstThree = scores.slice(0, 3);
          const lastThree = scores.slice(-3);
          const firstAvg =
            firstThree.reduce((sum, score) => sum + score, 0) /
            firstThree.length;
          const lastAvg =
            lastThree.reduce((sum, score) => sum + score, 0) / lastThree.length;
          improvementRate = ((lastAvg - firstAvg) / firstAvg) * 100;
        }

        // Get last activity
        const lastAttempt = attempts[attempts.length - 1];
        const daysSinceLastActivity = Math.floor(
          (Date.now() - new Date(lastAttempt.attemptDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const lastActivity =
          daysSinceLastActivity === 0
            ? "Today"
            : daysSinceLastActivity === 1
            ? "1 day ago"
            : `${daysSinceLastActivity} days ago`;

        return {
          id: trainee.id,
          rank: trainee.leaderboard?.rank || 999,
          trainee: {
            name: trainee.user.name,
            email: trainee.user.email,
            institution: trainee.institution,
            graduationYear: trainee.graduationYear,
          },
          totalAttempts: attempts.length,
          bestScore: `${bestScore}%`,
          averageScore: `${averageScore.toFixed(1)}%`,
          totalTrainingTime,
          improvementRate,
          lastActivity,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aScore = Number.parseInt(a!.bestScore.replace("%", ""));
        const bScore = Number.parseInt(b!.bestScore.replace("%", ""));
        return bScore - aScore;
      })
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // Update leaderboard ranks in database
    for (const entry of leaderboardData) {
      // Ensure entry.id and other required fields are not undefined
      if (!entry?.id) continue;
      await prisma.leaderboard.upsert({
        where: { traineeProfileId: entry.id },
        update: {
          rank: entry.rank,
          bestScore: entry.bestScore ?? "",
          averageScore: entry.averageScore ?? "",
          totalAttempts: entry.totalAttempts ?? 0,
          totalTrainingTime: entry.totalTrainingTime ?? 0,
        },
        create: {
          traineeProfileId: entry.id,
          rank: entry.rank,
          bestScore: entry.bestScore ?? "",
          averageScore: entry.averageScore ?? "",
          totalAttempts: entry.totalAttempts ?? 0,
          totalTrainingTime: entry.totalTrainingTime ?? 0,
        },
      });
    }

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error("Rankings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rankings" },
      { status: 500 }
    );
  }
}
