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
        mentorProfile: true,
      },
    });

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const profile = {
      name: user.name,
      email: user.email,
      specialization: user.mentorProfile.specialization,
      qualification: user.mentorProfile.qualification,
      department: user.mentorProfile.department,
      mentorCode: user.mentorProfile.mentorCode,
      mentorCodeExpiry: user.mentorProfile.mentorCodeExpiry?.toISOString(),
      isCodeActive: user.mentorProfile.isCodeActive,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
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
    const { name, email, specialization, qualification, department } = body;

    // Update user and mentor profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        mentorProfile: {
          update: {
            specialization,
            qualification,
            department,
          },
        },
      },
      include: {
        mentorProfile: true,
      },
    });

    const profile = {
      name: updatedUser.name,
      email: updatedUser.email,
      specialization: updatedUser.mentorProfile?.specialization,
      qualification: updatedUser.mentorProfile?.qualification,
      department: updatedUser.mentorProfile?.department,
      mentorCode: updatedUser.mentorProfile?.mentorCode,
      mentorCodeExpiry:
        updatedUser.mentorProfile?.mentorCodeExpiry?.toISOString(),
      isCodeActive: updatedUser.mentorProfile?.isCodeActive,
      createdAt: updatedUser.createdAt.toISOString(),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
