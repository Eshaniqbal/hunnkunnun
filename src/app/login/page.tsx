"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push(redirectPath);
    }
  }, [currentUser, authLoading, router, redirectPath]);

  const handleLogin = async (values: LoginFormValues) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ 
        title: "Login Successful", 
        description: "Welcome back! Redirecting...",
        variant: "success"
      });
      router.push(redirectPath);
    } catch (error: any) {
      let errorMessage = "Failed to login. Please try again.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      console.error("Login error:", {
        error: error.message,
        code: error.code,
        email: values.email
      });
      throw new Error(errorMessage);
    }
  };

  if (authLoading || (!authLoading && currentUser)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Card className="dark:bg-gray-800 border-0 dark:border dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center dark:text-white">Login</CardTitle>
            <CardDescription className="text-center dark:text-gray-300">
              Enter your email and password to login
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm
              schema={loginSchema}
              onSubmit={handleLogin}
              formTitle="Welcome Back"
              submitButtonText="Login"
            />
            <div className="mt-4 text-center text-sm dark:text-gray-300">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline dark:text-blue-400"
              >
                Forgot your password?
              </Link>
              <div className="mt-2">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary hover:underline dark:text-blue-400"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
