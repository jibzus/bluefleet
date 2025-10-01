"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signUpAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

export default function SignUp() {
  const router = useRouter();
  const [state, formAction] = useFormState(signUpAction, {});

  useEffect(() => {
    if (state.success) {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">Join BlueFleet to start leasing vessels</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              autoComplete="name"
            />
            {state.errors?.name && (
              <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {state.errors?.email && (
              <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={6}
            />
            {state.errors?.password && (
              <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium">
              Account Type
            </label>
            <select
              id="role"
              name="role"
              required
              defaultValue="OPERATOR"
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="OPERATOR">Operator (Lease vessels)</option>
              <option value="OWNER">Owner (List vessels)</option>
              <option value="ADMIN">Admin (Platform management)</option>
              <option value="REGULATOR">Regulator (Compliance oversight)</option>
            </select>
            {state.errors?.role && (
              <p className="mt-1 text-sm text-red-600">{state.errors.role[0]}</p>
            )}
          </div>

          <SubmitButton />

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/(auth)/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
