"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, User, LogIn, LogOut, Menu, X, ListFilter } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out successfully",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-foreground rounded-full flex items-center justify-center">
            <span className="text-background font-bold text-sm sm:text-xl">H</span>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-[8px] sm:text-xs">K</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-xl text-foreground tracking-tight">HyounKunun</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Kashmir's Marketplace</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
          </Button>
          {currentUser ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/listings/new" className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Listing</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile/listings" className="flex items-center gap-2">
                  <ListFilter className="h-5 w-5" />
                  <span>My Listings</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </Button>
              <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden border-t border-border overflow-hidden transition-all duration-200",
        isMenuOpen ? "max-h-64" : "max-h-0"
      )}>
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
          <Button variant="ghost" className="justify-start" asChild>
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
          </Button>
          {currentUser ? (
            <>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/listings/new" className="flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Listing</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/profile/listings" className="flex items-center space-x-2">
                  <ListFilter className="h-5 w-5" />
                  <span>My Listings</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/profile" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Sign Out</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/login" className="flex items-center space-x-2">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
