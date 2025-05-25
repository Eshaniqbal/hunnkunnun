"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword
} from "firebase/auth";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters."),
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

export default function EditProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    } else if (currentUser) {
      setProfileData({
        displayName: currentUser.displayName || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser, authLoading, router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsSubmitting(true);
      const validatedData = profileSchema.parse(profileData);

      if (!auth.currentUser) {
        throw new Error("No authenticated user found");
      }

      // Update display name if changed
      if (validatedData.displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: validatedData.displayName,
        });
      }

      // Update email if changed
      if (validatedData.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, validatedData.email);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });

    } catch (error: any) {
      console.error("Profile update error:", error);
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log back in to change your email.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use.";
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.email) return;

    try {
      setIsSubmitting(true);
      const validatedData = passwordSchema.parse(passwordData);

      // First sign in again to get fresh auth
      await signInWithEmailAndPassword(
        auth,
        currentUser.email,
        validatedData.currentPassword
      );

      // Now update the password
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, validatedData.newPassword);

        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated.",
        });

        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        throw new Error("No authenticated user found");
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      let errorMessage = "Failed to update password. Please try again.";
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Please choose a stronger password.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log back in to change your password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
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

  if (authLoading || !currentUser) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-8">
      <div className="w-full max-w-2xl px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information and account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile Information</TabsTrigger>
                <TabsTrigger value="security">Security Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleProfileChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
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
                        Updating Profile...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="security">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      type="password"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
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
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 