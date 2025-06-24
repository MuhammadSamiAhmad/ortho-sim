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

// Login schema
export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// This schema defines the raw form input, where graduationYear is a string
export const TraineeRegistrationFormSchema = z.object({
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
  graduationYear: z.string().min(4, "Must be a 4-digit year"),
  mentorCode: z.string().min(1, "Mentor code is required"),
});

// A second schema for the *output* after transformation
// This schema is for the API: it takes the form data and transforms graduationYear into a number
export const TraineeRegistrationSchema = TraineeRegistrationFormSchema.extend({
  graduationYear: z.coerce // `coerce` attempts to convert the type
    .number({ invalid_type_error: "Graduation year must be a number" })
    .min(1920, "Year must be 1920 or later")
    .max(new Date().getFullYear() + 5, "Year seems too far in the future"),
});

// Validated output types (after Zod transformation)
// ✅ Inferred directly from the schemas
// --- Type Exports ---

// For Mentor (input and output types are the same)
export type MentorRegistrationFormData = z.infer<
  typeof MentorRegistrationSchema
>;
export type MentorRegistrationData = z.infer<typeof MentorRegistrationSchema>;

// For Trainee (form input and final API data types are different)
export type TraineeRegistrationFormData = z.infer<
  typeof TraineeRegistrationFormSchema
>;
export type TraineeRegistrationData = z.infer<typeof TraineeRegistrationSchema>;

// For Login
export type LoginData = z.infer<typeof LoginSchema>;
