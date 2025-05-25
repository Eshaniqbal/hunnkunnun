
import { getListingById } from "@/actions/listings";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Mail, MapPin, Tag, UserCircle, IndianRupee, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ListingDetailPageProps {
  params: { id: string };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const listing = await getListingById(params.id);

  if (!listing) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Listing Not Found</h1>
        <p>The listing you are looking for does not exist or may have been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/">Back to Listings</Link>
        </Button>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(listing.price);

  const postedDate = listing.createdAt && (listing.createdAt as any).toDate 
    ? formatDistanceToNow((listing.createdAt as any).toDate(), { addSuffix: true }) 
    : 'Date N/A';


  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card className="overflow-hidden shadow-xl bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-primary">{listing.title}</CardTitle>
          <div className="flex flex-wrap items-center text-sm text-muted-foreground pt-1 gap-x-4 gap-y-1">
            <div className="flex items-center">
              <MapPin size={16} className="mr-1.5 text-accent" />
              <span>{listing.location.city}, {listing.location.address}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-1.5 text-accent" />
              <span>Posted {postedDate}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {listing.images && listing.images.length > 0 && (
            <Carousel className="w-full rounded-lg overflow-hidden border bg-muted/20">
              <CarouselContent>
                {listing.images.map((src, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[16/10] relative"> {/* Adjusted aspect ratio */}
                      <Image 
                        src={src} 
                        alt={`${listing.title} - image ${index + 1}`} 
                        layout="fill" 
                        objectFit="contain"
                        data-ai-hint="product detail"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {listing.images.length > 1 && (
                <>
                  <CarouselPrevious className="ml-16" />
                  <CarouselNext className="mr-16" />
                </>
              )}
            </Carousel>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground/90">Price</h2>
                <p className="text-3xl font-bold text-primary flex items-center">
                  <IndianRupee size={28} className="mr-1"/>{formattedPrice.replace('₹', '')}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground/90">Description</h2>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>
              {listing.tags && listing.tags.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-foreground/90">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
                        <Tag size={14} className="mr-1.5" /> {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="md:col-span-1 space-y-4">
               <Card className="bg-background/70 p-4 border">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-lg text-foreground/90">Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                   <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback><UserCircle size={24} /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{listing.userName || "Seller"}</p>
                      {/* <p className="text-xs text-muted-foreground">Member since N/A</p> */}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-foreground">
                    <Mail size={16} className="mr-2 text-accent flex-shrink-0" />
                    <span className="truncate">{listing.userEmail || "Not available"}</span>
                  </div>
                   {/* Example: Add phone number if available - ensure privacy considerations */}
                  {/* <div className="flex items-center text-sm text-foreground">
                    <Phone size={16} className="mr-2 text-accent flex-shrink-0" />
                    <span>+91 XXXXX XXXXX</span>
                  </div> */}
                </CardContent>
              </Card>
              <Card className="bg-background/70 p-4 border">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-lg text-foreground/90">Category</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Badge variant="default" className="text-md py-1 px-3">{listing.category}</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
         <CardFooter>
            <Button asChild className="w-full md:w-auto">
              <Link href="/">Back to All Listings</Link>
            </Button>
          </CardFooter>
      </Card>
    </div>
  );
}
