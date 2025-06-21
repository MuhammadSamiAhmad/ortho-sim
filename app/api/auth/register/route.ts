import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import {
  MentorRegistrationSchema,
  TraineeRegistrationSchema,
} from "@/lib/validations";

// Type definitions for API responses
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
  details: Array<{
    field: string | number;
    message: string;
  }>;
}

// Prisma error type
interface PrismaError {
  code: string;
  message: string;
  meta?: Record<string, unknown>;
}

// Combined schema for initial validation
const BaseRegistrationSchema = z.object({
  userType: z.enum(["MENTOR", "TRAINEE"]),
});

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

    // First, validate the basic structure
    const baseValidation = BaseRegistrationSchema.safeParse(body);
    if (!baseValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: baseValidation.error.errors.map((err) => ({
            field: err.path[0],
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { userType, ...userData } = body;

    // Validate based on user type
    const schema =
      userType === "MENTOR"
        ? MentorRegistrationSchema
        : TraineeRegistrationSchema;

    const validationResult = schema.safeParse(userData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors.map((err) => ({
            field: err.path[0],
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Account already exists",
          message:
            "An account with this email address already exists. Please use a different email or try signing in instead.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    if (userType === "MENTOR") {
      const mentorData = validatedData as z.infer<
        typeof MentorRegistrationSchema
      >;

      // Generate unique mentor code
      const mentorCode = `MENTOR_${Date.now()
        .toString()
        .slice(-8)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      try {
        // Create mentor user and profile
        const user = await prisma.user.create({
          data: {
            email: mentorData.email,
            password: hashedPassword,
            name: mentorData.name,
            userType: "MENTOR",
            mentorProfile: {
              create: {
                specialization: mentorData.specialization,
                qualification: mentorData.qualification,
                mentorCode,
                mentorCodeExpiry: new Date(
                  Date.now() + 365 * 24 * 60 * 60 * 1000
                ), // 1 year
                isCodeActive: true,
              },
            },
          },
          include: { mentorProfile: true },
        });

        return NextResponse.json({
          success: true,
          userId: user.id,
          name: user.name,
          userType: user.userType,
          mentorCode,
          mentorProfileId: user.mentorProfile?.id,
        });
      } catch (dbError) {
        console.error("Database error creating mentor:", dbError);
        throw dbError;
      }
    } else {
      const traineeData = validatedData as z.infer<
        typeof TraineeRegistrationSchema
      >;

      // Verify mentor code exists and is active
      const mentor = await prisma.mentorProfile.findUnique({
        where: { mentorCode: traineeData.mentorCode },
      });

      if (!mentor) {
        return NextResponse.json(
          {
            error: "Invalid mentor code",
            message:
              "The mentor code you entered doesn't exist. Please check with your mentor and try again.",
          },
          { status: 404 }
        );
      }

      if (!mentor.isCodeActive) {
        return NextResponse.json(
          {
            error: "Mentor code inactive",
            message:
              "The mentor code you entered is no longer active. Please request a new code from your mentor.",
          },
          { status: 403 }
        );
      }

      // Check if mentor code has expired
      if (mentor.mentorCodeExpiry && mentor.mentorCodeExpiry < new Date()) {
        return NextResponse.json(
          {
            error: "Mentor code expired",
            message:
              "The mentor code you entered has expired. Please request a new code from your mentor.",
          },
          { status: 403 }
        );
      }

      try {
        // Create trainee user and profile
        const user = await prisma.user.create({
          data: {
            email: traineeData.email,
            password: hashedPassword,
            name: traineeData.name,
            userType: "TRAINEE",
            traineeProfile: {
              create: {
                institution: traineeData.institution,
                graduationYear: traineeData.graduationYear,
                mentorId: mentor.id,
                leaderboard: {
                  create: {
                    totalAttempts: 0,
                    totalTrainingTime: 0,
                  },
                },
              },
            },
          },
          include: { traineeProfile: true },
        });

        return NextResponse.json({
          success: true,
          userId: user.id,
          name: user.name,
          userType: user.userType,
          traineeProfileId: user.traineeProfile?.id,
        });
      } catch (dbError) {
        console.error("Database error creating trainee:", dbError);
        throw dbError;
      }
    }
  } catch (err: unknown) {
    console.error("Registration error:", err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: err.errors.map((error) => ({
            field: error.path[0],
            message: error.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (err && typeof err === "object" && "code" in err) {
      const prismaError = err as PrismaError;
      console.error("Database error:", prismaError);

      // Handle specific Prisma error codes
      switch (prismaError.code) {
        case "P2002":
          // Unique constraint violation
          return NextResponse.json(
            {
              error: "Duplicate entry",
              message:
                "An account with this email already exists. Please use a different email address.",
            },
            { status: 409 }
          );
        case "P2003":
          // Foreign key constraint violation
          return NextResponse.json(
            {
              error: "Invalid reference",
              message:
                "The mentor code provided is invalid. Please check and try again.",
            },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            {
              error: "Database error",
              message: "Unable to create your account. Please try again later.",
            },
            { status: 500 }
          );
      }
    }

    // Handle other known error types
    if (err instanceof Error) {
      console.error("Application error:", err.message, err.stack);
      return NextResponse.json(
        {
          error: "Server error",
          message:
            "Something went wrong while creating your account. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    // Fallback for completely unknown errors
    console.error("Unknown error:", err);
    return NextResponse.json(
      {
        error: "Server error",
        message: "An unexpected error occurred. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
