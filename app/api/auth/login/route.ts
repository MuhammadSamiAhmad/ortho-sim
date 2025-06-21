import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

// Type definitions for API responses
interface LoginSuccessResponse {
  success: true;
  userId: string;
  name: string;
  userType: string;
  traineeProfileId: string | null;
  mentorProfileId: string | null;
}

interface LoginErrorResponse {
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

// Prisma error type (common database error structure)
interface PrismaError {
  code: string;
  message: string;
  meta?: Record<string, unknown>;
}

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(
  req: NextRequest
): Promise<
  NextResponse<
    LoginSuccessResponse | LoginErrorResponse | ValidationErrorResponse
  >
> {
  try {
    const body = await req.json();

    // Validate input data
    const validationResult = LoginSchema.safeParse(body);
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

    const { email, password } = validationResult.data;

    // 1. Look up the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { traineeProfile: true, mentorProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Account not found",
          message:
            "No account found with this email address. Please check your email or create a new account.",
        },
        { status: 404 }
      );
    }

    // 2. Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        {
          error: "Invalid password",
          message: "The password you entered is incorrect. Please try again.",
        },
        { status: 401 }
      );
    }

    // 3. Return success response with user data
    return NextResponse.json({
      success: true,
      userId: user.id,
      name: user.name,
      userType: user.userType,
      traineeProfileId: user.traineeProfile?.id ?? null,
      mentorProfileId: user.mentorProfile?.id ?? null,
    });
  } catch (err: unknown) {
    console.error("Login error:", err);

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

      return NextResponse.json<LoginErrorResponse>(
        {
          error: "Database error",
          message: "Unable to process your request. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Handle other known error types
    if (err instanceof Error) {
      console.error("Application error:", err.message, err.stack);
      return NextResponse.json(
        {
          error: "Server error",
          message:
            "Something went wrong on our end. Please try again in a moment.",
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
