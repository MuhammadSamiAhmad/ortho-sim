import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const surgeryAttemptId = searchParams.get("surgeryAttemptId");

    if (!surgeryAttemptId) {
      return NextResponse.json(
        { error: "Surgery attempt ID is required" },
        { status: 400 }
      );
    }

    // Get trainee profile from session
    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!traineeProfile) {
      return NextResponse.json(
        { error: "Trainee profile not found" },
        { status: 404 }
      );
    }

    // Verify the surgery attempt belongs to this trainee
    const surgeryAttempt = await prisma.surgeryAttempt.findFirst({
      where: {
        id: surgeryAttemptId,
        traineeProfileId: traineeProfile.id,
      },
    });

    if (!surgeryAttempt) {
      return NextResponse.json(
        { error: "Surgery attempt not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get feedback for the surgery attempt
    const feedbacks = await prisma.feedback.findMany({
      where: {
        surgeryAttemptId,
      },
      include: {
        mentor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
