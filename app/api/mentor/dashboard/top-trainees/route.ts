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

    // Get trainees with their leaderboard data
    const trainees = await prisma.traineeProfile.findMany({
      where: { mentorId: mentorProfile.id },
      include: {
        user: true,
        leaderboard: true,
        surgeryAttempts: {
          where: { isCompleted: true },
          orderBy: { score: "desc" },
        },
      },
    });

    // Calculate top performers
    const topTrainees = trainees
      .map((trainee) => {
        const completedAttempts = trainee.surgeryAttempts;
        const scores = completedAttempts
          .map((attempt) => Number.parseInt(attempt.score.replace("%", "")))
          .filter((score) => !isNaN(score));

        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const averageScore =
          scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;

        return {
          id: trainee.id,
          name: trainee.user.name,
          email: trainee.user.email,
          bestScore: `${bestScore}%`,
          averageScore: `${averageScore.toFixed(1)}%`,
          totalAttempts: completedAttempts.length,
          rank: trainee.leaderboard?.rank || 999,
        };
      })
      .filter((trainee) => trainee.totalAttempts > 0)
      .sort((a, b) => {
        const aScore = Number.parseInt(a.bestScore.replace("%", ""));
        const bScore = Number.parseInt(b.bestScore.replace("%", ""));
        return bScore - aScore;
      })
      .map((trainee, index) => ({ ...trainee, rank: index + 1 }));

    return NextResponse.json(topTrainees);
  } catch (error) {
    console.error("Top trainees error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top trainees" },
      { status: 500 }
    );
  }
}
