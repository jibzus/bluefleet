"use server";

import { signIn, signOut, signInSchema, signUpSchema } from "@/lib/auth";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export type FormState = {
  success?: boolean;
  error?: string;
  errors?: Record<string, string[]>;
};

export async function signInAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input
    const result = signInSchema.safeParse({ email, password });

    if (!result.success) {
      return {
        error: "Invalid input",
        errors: result.error.flatten().fieldErrors,
      };
    }

    // Attempt sign in
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    return { error: "An unexpected error occurred" };
  }
}

export async function signUpAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;

    // Validate input
    const result = signUpSchema.safeParse({ email, password, name, role });

    if (!result.success) {
      return {
        error: "Invalid input",
        errors: result.error.flatten().fieldErrors,
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "An account with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: result.data.role,
      },
    });

    // Sign in the new user
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/(auth)/signin");
}

