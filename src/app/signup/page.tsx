"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push("/");
    }
  }, [currentUser, authLoading, router]);

  const handleSignup = async (values: SignupFormValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      await updateProfile(userCredential.user, {
        displayName: values.displayName,
      });

      toast({
        title: "Account Created",
        description: "Welcome to our platform!",
      });

      router.push("/");
    } catch (error: any) {
      let errorMessage = "Failed to create account. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      console.error("Signup error:", error);
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
            <CardTitle className="text-2xl text-center dark:text-white">Create an Account</CardTitle>
            <CardDescription className="text-center dark:text-gray-300">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm
              schema={signupSchema}
              onSubmit={handleSignup}
              formTitle="Create an Account"
              submitButtonText="Sign Up"
              isSignUp
            />
            <div className="mt-4 text-center text-sm dark:text-gray-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline dark:text-blue-400"
              >
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
