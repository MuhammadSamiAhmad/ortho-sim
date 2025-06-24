import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

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

    return NextResponse.json({ mentorCode: mentorProfile.mentorCode });
  } catch (error) {
    console.error("Mentor code fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor code" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate new mentor code
    const newMentorCode = `MENTOR_${Date.now()
      .toString()
      .slice(-8)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const mentorProfile = await prisma.mentorProfile.update({
      where: { userId: session.user.id },
      data: {
        mentorCode: newMentorCode,
        mentorCodeExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isCodeActive: true,
      },
    });

    return NextResponse.json({ mentorCode: mentorProfile.mentorCode });
  } catch (error) {
    console.error("Mentor code generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate mentor code" },
      { status: 500 }
    );
  }
}
