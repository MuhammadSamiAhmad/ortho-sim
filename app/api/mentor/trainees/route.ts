// /api/mentor/trainees/route.ts (example path)

import { NextResponse } from "next/server";
import { auth } from "@/auth"; // ✅ NEW: Import the auth helper from your central file
import { prisma } from "@/lib/prisma";

// No more need for these old imports:
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    // ✅ NEW: The simpler way to get the session
    const session = await auth();

    // The rest of your code works perfectly!
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!mentorProfile) {
      return NextResponse.json(
        { error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    // ... all your existing logic to fetch and format trainees ...
    const trainees = await prisma.traineeProfile.findMany({
      where: { mentorId: mentorProfile.id },
      include: {
        user: true,
        surgeryAttempts: {
          orderBy: { attemptDate: "desc" },
          take: 1,
        },
        leaderboard: true,
      },
    });

    const formattedTrainees = trainees.map((trainee) => {
      // ... your formatting logic is unchanged ...
      const attempts = trainee.surgeryAttempts;
      const completedAttempts = attempts.filter((a) => a.isCompleted);
      const scores = completedAttempts
        .map((attempt) => parseInt(attempt.score.replace("%", "")))
        .filter((score) => !isNaN(score));
      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;
      const lastAttempt = attempts[0];
      const lastActivity = lastAttempt
        ? new Date(lastAttempt.attemptDate)
        : new Date(trainee.user.createdAt);
      const daysSinceLastActivity = Math.floor(
        (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      const status = daysSinceLastActivity <= 7 ? "active" : "inactive";

      return {
        id: trainee.id,
        user: {
          name: trainee.user.name,
          email: trainee.user.email,
          profileImage: trainee.user.profileImage,
        },
        institution: trainee.institution,
        graduationYear: trainee.graduationYear,
        totalAttempts: attempts.length,
        averageScore: `${averageScore.toFixed(1)}%`,
        lastActivity:
          daysSinceLastActivity === 0
            ? "Today"
            : `${daysSinceLastActivity} day(s) ago`,
        status,
      };
    });

    return NextResponse.json(formattedTrainees);
  } catch (error) {
    console.error("Trainees fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trainees" },
      { status: 500 }
    );
  }
}
