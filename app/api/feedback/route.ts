import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get mentor profile from session
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!mentorProfile) {
      return NextResponse.json(
        { error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { comment, rating, surgeryAttemptId } = body;

    if (!comment || !surgeryAttemptId) {
      return NextResponse.json(
        { error: "Comment and surgery attempt ID are required" },
        { status: 400 }
      );
    }

    // Verify the surgery attempt exists and belongs to one of the mentor's trainees
    const surgeryAttempt = await prisma.surgeryAttempt.findFirst({
      where: {
        id: surgeryAttemptId,
        traineeProfile: {
          mentorId: mentorProfile.id,
        },
      },
    });

    if (!surgeryAttempt) {
      return NextResponse.json(
        { error: "Surgery attempt not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create the feedback
    const feedback = await prisma.feedback.create({
      data: {
        comment,
        rating: rating || null,
        surgeryAttemptId,
        mentorProfileId: mentorProfile.id,
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
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Failed to create feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get mentor profile from session
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!mentorProfile) {
      return NextResponse.json(
        { error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    // Get feedback for the surgery attempt
    const feedbacks = await prisma.feedback.findMany({
      where: {
        surgeryAttemptId,
        surgeryAttempt: {
          traineeProfile: {
            mentorId: mentorProfile.id,
          },
        },
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
