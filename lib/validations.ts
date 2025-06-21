import { z } from "zod";

// Registration schemas
export const MentorRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
  specialization: z.string().min(1, "Specialization is required"),
  qualification: z.string().min(1, "Qualification is required"),
});

export const TraineeRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
  institution: z.string().min(1, "Institution is required"),
  graduationYear: z
    .union([
      z.string().transform((val, ctx) => {
        const parsed = Number.parseInt(val);
        if (isNaN(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be a valid number",
          });
          return z.NEVER;
        }
        return parsed;
      }),
      z.number(),
    ])
    .refine((val) => val >= 1920 && val <= 2026, {
      message: "Graduation year must be between 1920 and 2030",
    }),
  mentorCode: z.string().min(1, "Mentor code is required"),
});

// Login schema
export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type MentorRegistrationData = z.infer<typeof MentorRegistrationSchema>;
export type TraineeRegistrationData = z.infer<typeof TraineeRegistrationSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
