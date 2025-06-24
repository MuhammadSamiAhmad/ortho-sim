import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        traineeProfile: {
          include: {
            mentor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.traineeProfile) {
      return NextResponse.json(
        { error: "Trainee profile not found" },
        { status: 404 }
      );
    }

    const profile = {
      name: user.name,
      email: user.email,
      institution: user.traineeProfile.institution,
      graduationYear: user.traineeProfile.graduationYear,
      mentorName: user.traineeProfile.mentor.user.name,
      mentorEmail: user.traineeProfile.mentor.user.email,
      mentorSpecialization: user.traineeProfile.mentor.specialization,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Trainee profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, institution, graduationYear } = body;

    // Update user and trainee profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        traineeProfile: {
          update: {
            institution,
            graduationYear: graduationYear
              ? Number.parseInt(graduationYear)
              : null,
          },
        },
      },
      include: {
        traineeProfile: {
          include: {
            mentor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const profile = {
      name: updatedUser.name,
      email: updatedUser.email,
      institution: updatedUser.traineeProfile?.institution,
      graduationYear: updatedUser.traineeProfile?.graduationYear,
      mentorName: updatedUser.traineeProfile?.mentor.user.name,
      mentorEmail: updatedUser.traineeProfile?.mentor.user.email,
      mentorSpecialization: updatedUser.traineeProfile?.mentor.specialization,
      createdAt: updatedUser.createdAt.toISOString(),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Trainee profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
