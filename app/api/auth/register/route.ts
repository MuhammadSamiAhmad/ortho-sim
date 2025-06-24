// api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import {
  MentorRegistrationSchema,
  TraineeRegistrationSchema,
} from "@/lib/validations";

// --- Type Definitions for API Responses ---
interface RegistrationSuccessResponse {
  success: true;
  userId: string;
  name: string;
  userType: "MENTOR" | "TRAINEE";
  mentorCode?: string;
  traineeProfileId?: string;
  mentorProfileId?: string;
}
interface RegistrationErrorResponse {
  error: string;
  message: string;
}
interface ValidationErrorResponse {
  error: string;
  // details: z.ZodError<any>['flatten']['fieldErrors']; // Use Zod's flattened error type
}

// --- Zod Discriminated Union ---
// This is the key to solving the type-narrowing issue.
const CombinedRegistrationSchema = z.discriminatedUnion("userType", [
  MentorRegistrationSchema.extend({ userType: z.literal("MENTOR") }),
  TraineeRegistrationSchema.extend({ userType: z.literal("TRAINEE") }),
]);

// --- API Handler ---
export async function POST(
  req: NextRequest
): Promise<
  NextResponse<
    | RegistrationSuccessResponse
    | RegistrationErrorResponse
    | ValidationErrorResponse
  >
> {
  try {
    const body = await req.json();

    // 1. Validate the body against the combined schema ONCE.
    const validationResult = CombinedRegistrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // `validatedData` is now a perfectly typed discriminated union.
    const validatedData = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Account already exists",
          message: "An account with this email address already exists.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // --- Mentor Registration Flow ---
    if (validatedData.userType === "MENTOR") {
      // TypeScript now knows `validatedData` is the Mentor shape.
      const { name, email, specialization, qualification } = validatedData;
      const mentorCode = `MENTOR_${Date.now()
        .toString()
        .slice(-6)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const mentorUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          userType: "MENTOR",
          mentorProfile: {
            create: {
              specialization,
              qualification,
              mentorCode,
              isCodeActive: true,
              mentorCodeExpiry: new Date(
                Date.now() + 365 * 24 * 60 * 60 * 1000
              ),
            },
          },
        },
        include: { mentorProfile: true },
      });

      return NextResponse.json({
        success: true,
        userId: mentorUser.id,
        name: mentorUser.name,
        userType: mentorUser.userType,
        mentorCode,
        mentorProfileId: mentorUser.mentorProfile?.id,
      });
    }
    // --- Trainee Registration Flow ---
    else {
      // TypeScript now knows `validatedData` is the Trainee shape,
      // and `graduationYear` is a number.
      const { name, email, institution, graduationYear, mentorCode } =
        validatedData;

      const mentor = await prisma.mentorProfile.findUnique({
        where: { mentorCode },
      });
      if (
        !mentor ||
        !mentor.isCodeActive ||
        (mentor.mentorCodeExpiry && new Date() > mentor.mentorCodeExpiry)
      ) {
        return NextResponse.json(
          {
            error: "Invalid Mentor Code",
            message:
              "The mentor code you entered is invalid, inactive, or expired.",
          },
          { status: 404 }
        );
      }

      const traineeUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          userType: "TRAINEE",
          traineeProfile: {
            create: {
              institution,
              graduationYear, // NO ERROR HERE! It's a number.
              mentorId: mentor.id,
              leaderboard: { create: {} },
            },
          },
        },
        include: { traineeProfile: true }, // NO ERROR HERE!
      });

      return NextResponse.json({
        success: true,
        userId: traineeUser.id,
        name: traineeUser.name,
        userType: traineeUser.userType,
        traineeProfileId: traineeUser.traineeProfile?.id,
      });
    }
  } catch (err: unknown) {
    // FIX: All error responses now include a `message` property to match the types.
    console.error("Registration API Error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Unexpected Zod error",
          message: err.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
