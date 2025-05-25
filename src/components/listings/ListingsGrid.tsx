"use client";

import type { Listing, ListingCategory } from "@/types";
import { ListingCategories } from "@/types";
import ListingCard from "./ListingCard";
import { getListings } from "@/actions/listings";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, FilterX, Search, Frown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ALL_CATEGORIES_VALUE = "ALL_CATEGORIES";

export default function ListingsGrid() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  const [categoryFilter, setCategoryFilter] = useState<string>(""); // Empty string for placeholder
  const [cityFilter, setCityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();

  const fetchAndSetListings = async (filters?: { category?: string; city?: string }) => {
    setIsLoading(true);
    try {
      const fetchedListings = await getListings(filters);
      
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        setListings(fetchedListings.filter(listing => 
          listing.title.toLowerCase().includes(lowerSearchTerm) ||
          listing.description.toLowerCase().includes(lowerSearchTerm) ||
          listing.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
        ));
      } else {
        setListings(fetchedListings);
      }

    } catch (error) {
      console.error("Failed to fetch listings:", error);
      setListings([]); 
      toast({ title: "Error", description: "Failed to load listings. Please try again later.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch without specific filters
    fetchAndSetListings();
  }, []);

  const handleFilter = () => {
    startTransition(() => {
      const categoryToFetch = categoryFilter === ALL_CATEGORIES_VALUE || categoryFilter === "" ? undefined : categoryFilter;
      fetchAndSetListings({ 
        category: categoryToFetch, 
        city: cityFilter || undefined 
      });
    });
  };

  const handleResetFilters = () => {
    setCategoryFilter(""); // Reset to empty string to show placeholder
    setCityFilter("");
    setSearchTerm("");
    startTransition(() => {
      fetchAndSetListings(); // Fetch all listings
    });
  };
  
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Lat:", position.coords.latitude, "Lng:", position.coords.longitude);
          toast({title: "Location Fetched!", description:"For now, please manually enter your city for filtering. Geo-radius search coming soon!"});
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({title: "Location Error", description: "Could not get your location. Please ensure location services are enabled.", variant: "destructive"});
        }
      );
    } else {
      toast({title: "Geolocation Not Supported", description: "Your browser does not support geolocation.", variant: "destructive"});
    }
  };

  return (
    <div>
      <Card className="mb-8 shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Find What You Need</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Search by keyword (e.g. iPhone, Sofa...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
                {ListingCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              placeholder="Enter City (e.g. Srinagar, Jammu)" 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
            <Button onClick={handleUseMyLocation} variant="outline" className="w-full flex items-center gap-2">
              <MapPin size={16} /> Use My Location
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button onClick={handleFilter} className="w-full sm:w-auto flex items-center gap-2" disabled={isPending || isLoading}>
              {(isPending || isLoading) && <Loader2 size={16} className="animate-spin" />}
              <Search size={16}/> Apply Filters
            </Button>
            <Button onClick={handleResetFilters} variant="ghost" className="w-full sm:w-auto flex items-center gap-2" disabled={isPending || isLoading}>
              <FilterX size={16} /> Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && !isPending ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden bg-card">
              <div className="aspect-[16/10] bg-muted animate-pulse"></div>
              <CardContent className="p-4">
                <div className="h-5 w-3/4 bg-muted animate-pulse mb-2 rounded"></div>
                <div className="h-6 w-1/2 bg-muted animate-pulse mb-2 rounded"></div>
                <div className="h-4 w-1/4 bg-muted animate-pulse mb-1 rounded"></div>
                <div className="h-4 w-1/3 bg-muted animate-pulse rounded"></div>
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t">
                <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg shadow-md">
          <Frown size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-foreground">No listings found.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
