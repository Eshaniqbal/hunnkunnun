
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, User, LogIn, LogOut } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";

// Simple SVG Logo for Hunnkunnun
const HunnkunnunLogo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-8 w-8 text-primary">
    <path d="M20 80V20H35V65H65V80H20Z" />
    <path d="M80 80V20H65V65H35V80H80Z" />
    <circle cx="50" cy="50" r="10" fill="var(--accent)" />
  </svg>
);


export default function Navbar() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      router.push("/"); 
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ title: "Sign Out Error", description: "Failed to sign out. Please try again.", variant: "destructive" });
    }
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            <HunnkunnunLogo />
            Hunnkunnun
          </Link>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="ghost" asChild size="sm">
              <Link href="/" className="flex items-center gap-1 md:gap-2">
                <Home size={18} /> <span className="hidden md:inline">Browse</span>
              </Link>
            </Button>
            
            {loading ? (
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
                <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
              </div>
            ) : currentUser ? (
              <>
                <Button variant="ghost" asChild size="sm">
                  <Link href="/listings/new" className="flex items-center gap-1 md:gap-2">
                    <PlusCircle size={18} /> <span className="hidden md:inline">New Listing</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild size="sm">
                  <Link href="/profile" className="flex items-center gap-1 md:gap-2">
                    <User size={18} /> <span className="hidden md:inline">Profile</span>
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut} size="sm" className="flex items-center gap-1 md:gap-2">
                  <LogOut size={18} /> <span className="hidden md:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/login" className="flex items-center gap-1 md:gap-2">
                  <LogIn size={18} /> Login / Sign Up
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
