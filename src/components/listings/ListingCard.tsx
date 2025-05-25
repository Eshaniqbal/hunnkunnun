import type { Listing } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Tag, IndianRupee, Heart } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);

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
    <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col group">
      <Link href={`/listings/${listing.id}`} className="block h-full flex flex-col">
        <CardHeader className="p-0 relative">
          <div className="aspect-square relative w-full overflow-hidden">
            <Image
              src={listing.images[0] || "https://placehold.co/400x400.png?text=No+Image"}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="product item"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm hover:bg-background/70 z-10"
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
            >
              <Heart className={cn(
                "h-5 w-5 transition-colors",
                isLiked ? "fill-red-500 stroke-red-500" : "stroke-foreground"
              )} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 flex-grow">
          <CardTitle className="text-base sm:text-lg mb-1 leading-tight line-clamp-2">{listing.title}</CardTitle>
          <p className="text-foreground font-semibold text-lg sm:text-xl mb-2 flex items-center">
            <IndianRupee size={18} className="mr-0.5"/>{formattedPrice.replace('₹','')}
          </p>
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <MapPin size={12} className="mr-1 text-accent" />
            {listing.location.city}
          </div>
          <Badge variant="secondary" className="text-xs mb-2">{listing.category}</Badge>
        </CardContent>
        <CardFooter className="p-2 sm:p-4 pt-0 border-t mt-auto">
          <div className="w-full">
            <div className="flex flex-wrap gap-1 mb-2">
              {listing.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs py-0.5 px-1.5">
                  <Tag size={10} className="mr-0.5" />{tag}
                </Badge>
              ))}
              {listing.tags.length > 2 && (
                <Badge variant="outline" className="text-xs py-0.5 px-1.5">+{listing.tags.length - 2}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
