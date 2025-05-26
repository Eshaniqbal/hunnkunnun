"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getListings } from "@/actions/listings";
import type { Listing } from "@/types";
import { ListingCategories } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Search, 
  MapPin, 
  Tag, 
  Plus, 
  ShieldCheck, 
  Users, 
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
  ShoppingBag
} from "lucide-react";

export default function HomePage() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    async function fetchListings() {
      try {
        const fetchedListings = await getListings({
          category: selectedCategory === "all" ? undefined : selectedCategory,
          city: selectedCity === "all" ? undefined : selectedCity,
        });
        setListings(fetchedListings);

        // Extract unique cities
        const uniqueCities = Array.from(
          new Set(fetchedListings.map(listing => listing.location.city))
        );
        setCities(uniqueCities);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [selectedCategory, selectedCity]);

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative -mt-8 py-20 text-center">
        <div className="container mx-auto px-4 space-y-6">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tight text-foreground">
              Buy & Sell in Kashmir
            </h1>
            <p className="text-2xl font-medium text-foreground/80">
              Your trusted marketplace for pre-owned treasures
            </p>
          </div>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Discover quality second-hand items, connect with verified local sellers, and be part of Kashmir's largest community for pre-owned goods.
          </p>
          {!currentUser && (
            <div className="flex gap-4 justify-center pt-8">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/signup">Start Selling</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                <Link href="/login">Browse Items</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Find What You Need</h2>
            <p className="text-foreground/80 font-medium">Search through thousands of listings in your area</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative col-span-full md:col-span-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-foreground" />
              <Input
                placeholder="Search listings..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ListingCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Quick Actions for logged-in users */}
      {currentUser && (
        <section className="container mx-auto px-4">
          <div className="flex justify-end">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/listings/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Listing
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Listings Grid Section */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-foreground">Latest Listings</h2>
          <p className="text-foreground/80 font-medium">Browse through our most recent offerings</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground">No listings found</h3>
            <p className="text-foreground/80">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="block h-full">
                <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <div className="relative w-full pt-[100%]">
                    {listing.images[0] && (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute bottom-2 right-2 bg-foreground/90 backdrop-blur-sm text-background px-2 py-1 rounded-md text-xs sm:text-sm">
                      ₹{listing.price}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <div className="mt-auto pt-2">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-foreground/80">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">{listing.location.city}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        {listing.tags.slice(0, 2).map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center text-[10px] sm:text-xs bg-accent/50 text-foreground px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md"
                          >
                            <Tag className="h-2 w-2 sm:h-3 sm:w-3 mr-1 shrink-0" />
                            <span className="truncate">{tag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features Section with Icons */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-card rounded-3xl p-12">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why Choose KashurMart?</h2>
            <p className="text-foreground/80 font-medium">Experience the best of local commerce</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3 p-6 bg-background rounded-xl">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-xl text-foreground">Secure Transactions</h3>
              <p className="text-foreground/80">
                Our platform ensures safe and secure transactions with verified sellers and buyers.
              </p>
            </div>
            <div className="text-center space-y-3 p-6 bg-background rounded-xl">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-xl text-foreground">Local Community</h3>
              <p className="text-foreground/80">
                Connect with trusted buyers and sellers in your local area for convenient exchanges.
              </p>
            </div>
            <div className="text-center space-y-3 p-6 bg-background rounded-xl">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-xl text-foreground">Easy to Use</h3>
              <p className="text-foreground/80">
                Simple and intuitive interface for buying and selling items quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-bold text-foreground">Popular Categories</h2>
          <p className="text-foreground/80 font-medium">Explore items by category</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ListingCategories.slice(0, 8).map((category) => (
            <Button
              key={category}
              variant="outline"
              className="h-auto py-8 flex flex-col gap-3 hover:bg-primary/5 border-primary/20"
              onClick={() => setSelectedCategory(category)}
            >
              <ShoppingBag className="h-6 w-6" />
              <span>{category}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4">
        <div className="bg-card rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Start?</h2>
          <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto font-medium">
            Join thousands of users making great deals every day on Kashmir's fastest-growing marketplace.
          </p>
          {!currentUser && (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">
                Create Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
