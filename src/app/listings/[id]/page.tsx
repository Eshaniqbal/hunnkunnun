"use client";

import { getListingById } from "@/actions/listings";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MapPin, Tag, UserCircle, IndianRupee, Phone, MessageCircle, Flag, Mail, ShieldCheck, LogIn } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ReportListingModal } from "@/components/listings/ReportListingModal";
import { reportListing } from "@/actions/reports";
import { useToast } from "@/hooks/use-toast";
import { use } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const resolvedParams = use(params);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchListing() {
      try {
        const data = await getListingById(resolvedParams.id);
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Listing not found</h2>
        <p className="text-muted-foreground mt-2">The listing you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const postedDate = format(new Date(listing.createdAt), "PPP");
  const timeAgo = formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true });

  const handleContactClick = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to view seller contact details",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    setShowContact(true);
  };

  const handleWhatsAppClick = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to contact the seller",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    const whatsappUrl = `https://wa.me/${listing.phoneNumber}?text=Hi, I'm interested in your listing "${listing.title}" on HyounKunun.`;
    window.open(whatsappUrl, '_blank');
  };

  const handleReport = async (reason: string, description: string) => {
    try {
      await reportListing(resolvedParams.id, reason, description);
    } catch (error) {
      console.error("Error reporting listing:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-xl bg-card">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-primary">{listing.title}</CardTitle>
                <div className="flex flex-wrap items-center text-sm text-muted-foreground pt-1 gap-x-4 gap-y-1">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1.5 text-accent" />
                    <span>{listing.location.city}, {listing.location.address}</span>
                  </div>
                  <div className="flex items-center" title={postedDate}>
                    <Clock size={16} className="mr-1.5 text-accent" />
                    <span>Posted {timeAgo}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setIsReportModalOpen(true)}
              >
                <Flag className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {listing.images && listing.images.length > 0 && (
              <Carousel className="w-full rounded-lg overflow-hidden border bg-muted/20">
                <CarouselContent>
                  {listing.images.map((src: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-[16/10] relative">
                        <Image 
                          src={src} 
                          alt={`${listing.title} - image ${index + 1}`} 
                          fill
                          className="object-contain"
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

            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1 text-foreground/90">Price</h2>
                    <p className="text-3xl font-bold text-foreground flex items-center">
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
                        {listing.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
                            <Tag size={14} className="mr-1.5" /> {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Seller Information</CardTitle>
                      {!currentUser && (
                        <CardDescription>
                          Login to view seller details and contact information
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentUser ? (
                        <>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={listing.userPhotoURL} />
                              <AvatarFallback>
                                <UserCircle className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{listing.userName}</p>
                              <p className="text-sm text-muted-foreground">Member since {format(new Date(listing.userJoinDate || Date.now()), "MMMM yyyy")}</p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>{listing.userEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{listing.location.city}</span>
                            </div>
                            {listing.userVerified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verified Seller
                              </Badge>
                            )}
                          </div>

                          {!showContact ? (
                            <Button 
                              className="w-full" 
                              onClick={handleContactClick}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Show Contact
                            </Button>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-lg font-medium flex items-center gap-1">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">+91</span>
                                {listing.phoneNumber.replace('+91', '')}
                              </p>
                              <Button 
                                className="w-full" 
                                onClick={handleWhatsAppClick}
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp Seller
                              </Button>
                            </div>
                          )}

                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">Safety Tips</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Meet in a safe public place</li>
                              <li>• Don't pay in advance</li>
                              <li>• Check the item before buying</li>
                              <li>• Report suspicious behavior</li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <Button
                            className="w-full"
                            onClick={() => router.push('/login')}
                          >
                            <LogIn className="mr-2 h-4 w-4" />
                            Login to View Details
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {currentUser && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Listing Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Listed on</span>
                          <span>{format(new Date(listing.createdAt), "PPP")}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Category</span>
                          <span>{listing.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Views</span>
                          <span>{listing.views || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Item condition</span>
                          <span>{listing.condition || "Not specified"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ReportListingModal
        listingId={resolvedParams.id}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReport={handleReport}
      />
    </div>
  );
}
