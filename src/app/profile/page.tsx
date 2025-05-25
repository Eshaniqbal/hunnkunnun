
"use client";

import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, UserCircle, Edit3, ListOrdered, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Listing } from "@/types";
import { getListings } from "@/actions/listings";
import ListingCard from "@/components/listings/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const fetchUserListings = async () => {
        setLoadingListings(true);
        try {
          // This action needs to be updated to use currentUser.uid securely.
          // For now, assuming `getListings` can take `userId` which is `currentUser.uid`
          const listings = await getListings({ userId: currentUser.uid });
          setUserListings(listings);
        } catch (error) {
          console.error("Failed to fetch user listings:", error);
          toast({title: "Error", description: "Could not load your listings.", variant: "destructive"});
        } finally {
          setLoadingListings(false);
        }
      };
      fetchUserListings();
    }
  }, [currentUser, toast]);

  if (authLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin text-primary">
            <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.93005 4.93005L7.76005 7.76005" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.93005 19.07L7.76005 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.24 7.76005L19.07 4.93005" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }

  if (!currentUser) {
    // This case should be handled by AuthGuard, but as a fallback:
    return <AuthGuard><p>Redirecting to login...</p></AuthGuard>;
  }
  
  const creationTime = currentUser.metadata?.creationTime;
  const formattedJoinDate = creationTime ? format(new Date(creationTime), "MMMM yyyy") : "N/A";

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <Card className="shadow-lg bg-card">
          <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6">
            <Avatar className="h-24 w-24 border-2 border-primary text-primary">
              <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} />
              <AvatarFallback className="text-4xl bg-primary/10">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <UserCircle size={48}/>}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left">
              <CardTitle className="text-3xl">{currentUser.displayName || "Valued User"}</CardTitle>
              <div className="mt-1 space-y-0.5">
                <CardDescription className="flex items-center justify-center sm:justify-start text-sm">
                  <Mail size={14} className="mr-2 text-accent" /> {currentUser.email}
                </CardDescription>
                <CardDescription className="flex items-center justify-center sm:justify-start text-sm">
                  <CalendarDays size={14} className="mr-2 text-accent" /> Joined {formattedJoinDate}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => toast({title: "Coming Soon!", description: "Profile editing will be available shortly."})} className="mt-4 sm:mt-0 self-center sm:self-start">
              <Edit3 size={16} className="mr-2"/> Edit Profile
            </Button>
          </CardHeader>
        </Card>

        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <ListOrdered size={24} className="mr-2 text-primary" /> My Listings
            </CardTitle>
            <CardDescription>Manage your active and past listings.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingListings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                 <Card key={i} className="overflow-hidden bg-background/50">
                    <div className="aspect-[16/10] bg-muted animate-pulse"></div>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2 rounded" />
                      <Skeleton className="h-6 w-1/2 mb-2 rounded" />
                      <Skeleton className="h-4 w-1/4 mb-1 rounded" />
                    </CardContent>
                     <CardFooter className="p-4 pt-0 border-t">
                        <Skeleton className="h-4 w-full rounded" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>You haven&apos;t posted any listings yet.</p>
                <Button asChild variant="link" className="mt-2 text-accent">
                  <Link href="/listings/new">Create your first listing!</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
