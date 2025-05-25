"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    async function verifyCode() {
      if (!oobCode) {
        toast({
          title: "Invalid Link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidCode(true);
      } catch (error) {
        console.error("Error verifying reset code:", error);
        toast({
          title: "Invalid Link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive",
        });
        router.push("/login");
      } finally {
        setIsVerifying(false);
      }
    }

    verifyCode();
  }, [oobCode, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode) return;

    try {
      const { password: validatedPassword } = passwordSchema.parse({ password, confirmPassword });
      setIsSubmitting(true);
      
      await confirmPasswordReset(auth, oobCode, validatedPassword);
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      
      router.push("/login");
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error.code === "auth/expired-action-code") {
        errorMessage = "This password reset link has expired. Please request a new one.";
      } else if (error.code === "auth/invalid-action-code") {
        errorMessage = "This password reset link is invalid. Please request a new one.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Please choose a stronger password.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="container max-w-md py-8 text-center">
        <Card>
          <CardContent className="pt-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Verifying reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidCode) {
    return null; // The user will be redirected by the useEffect
  }

  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 