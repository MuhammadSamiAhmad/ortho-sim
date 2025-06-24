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

    // Get recent surgery attempts from mentor's trainees
    const recentAttempts = await prisma.surgeryAttempt.findMany({
      where: {
        traineeProfile: {
          mentorId: mentorProfile.id,
        },
      },
      include: {
        traineeProfile: {
          include: {
            user: true,
          },
        },
        feedbacks: true,
      },
      orderBy: {
        attemptDate: "desc",
      },
      take: 10,
    });

    const formattedAttempts = recentAttempts.map((attempt) => ({
      id: attempt.id,
      trainee: {
        name: attempt.traineeProfile.user.name,
      },
      score: attempt.score,
      attemptDate: attempt.attemptDate.toISOString(),
      isCompleted: attempt.isCompleted,
      feedbackCount: attempt.feedbacks.length,
    }));

    return NextResponse.json(formattedAttempts);
  } catch (error) {
    console.error("Recent attempts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent attempts" },
      { status: 500 }
    );
  }
}
