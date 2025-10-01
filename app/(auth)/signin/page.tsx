"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInAction } from "../actions";
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
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export default function SignIn() {
  const router = useRouter();
  const [state, formAction] = useFormState(signInAction, {});

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
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your BlueFleet account</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

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
              autoComplete="current-password"
            />
            {state.errors?.password && (
              <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
            )}
          </div>

          <SubmitButton />

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/(auth)/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-900">Demo Accounts:</p>
            <ul className="mt-2 space-y-1 text-xs text-blue-700">
              <li>• admin@bluefleet.com (Admin)</li>
              <li>• owner@bluefleet.com (Owner)</li>
              <li>• operator@bluefleet.com (Operator)</li>
              <li>• regulator@bluefleet.com (Regulator)</li>
              <li className="mt-2 font-medium">Password: password123</li>
            </ul>
          </div>
        </form>
      </Card>
    </main>
  );
}
