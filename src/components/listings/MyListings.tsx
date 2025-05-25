"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getListings, deleteListing } from "@/actions/listings";
import type { Listing } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Tag, IndianRupee, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function MyListings() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMyListings() {
      if (!currentUser?.uid) return;
      
      try {
        const fetchedListings = await getListings({ userId: currentUser.uid });
        setListings(fetchedListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast({
          title: "Error",
          description: "Failed to load your listings. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyListings();
  }, [currentUser?.uid, toast]);

  const handleDelete = async () => {
    if (!listingToDelete) return;

    try {
      console.log("Attempting to delete listing with ID:", listingToDelete);
      
      await deleteListing(listingToDelete);
      setListings(listings.filter(listing => listing.id !== listingToDelete));
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setListingToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">No Listings Found</h2>
        <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
        <Button asChild>
          <Link href="/listings/new">Create Your First Listing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => {
          const formattedPrice = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(listing.price);

          const timeAgo = listing.createdAt && (listing.createdAt as any).toDate
            ? formatDistanceToNow((listing.createdAt as any).toDate(), { addSuffix: true })
            : 'Date N/A';

          return (
            <Card key={listing.id} className="overflow-hidden">
              <Link href={`/listings/${listing.id}`}>
                <div className="aspect-square relative">
                  <Image
                    src={listing.images[0] || "https://placehold.co/400x400.png?text=No+Image"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{listing.title}</h3>
                <p className="text-foreground font-semibold text-xl mb-2 flex items-center">
                  <IndianRupee size={18} className="mr-0.5"/>{formattedPrice.replace('₹','')}
                </p>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin size={14} className="mr-1" />
                  {listing.location.city}
                </div>
                <Badge variant="secondary" className="mb-2">{listing.category}</Badge>
                <div className="flex flex-wrap gap-1 mb-2">
                  {listing.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag size={10} className="mr-1" />{tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setListingToDelete(listing.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!listingToDelete} onOpenChange={() => setListingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your listing and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 