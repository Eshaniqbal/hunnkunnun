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
import { Card, CardContent } from "@/components/ui/card";
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
  ShoppingBag,
  Smartphone,
  Tv,
  Car,
  Home,
  Sofa,
  Shirt,
  Book,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Dog,
  Wheat,
  Watch,
  Music,
  Building2,
  Sparkles,
  Baby
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);

  const fetchListings = async (pageNum: number, isLoadMore: boolean = false) => {
    try {
      const response = await getListings({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        city: selectedCity === "all" ? undefined : selectedCity,
        page: pageNum,
        limit: 8,
      });

      if (isLoadMore) {
        setListings(prev => [...prev, ...response.listings]);
      } else {
        setListings(response.listings);
      }
      setHasMore(response.hasMore);

      // Extract unique cities
      const uniqueCities = Array.from(
        new Set(response.listings.map(listing => listing.location.city))
      );
      if (!isLoadMore) {
        setCities(uniqueCities);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetchListings(1);
  }, [selectedCategory, selectedCity]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchListings(nextPage, true);
    setPage(nextPage);
  };

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
      <section id="listings" className="container mx-auto px-4">
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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredListings.map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`} className="block h-full">
                  <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          ₹{listing.price.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground line-clamp-1">{listing.title}</h3>
                        <p className="text-sm text-foreground/80 line-clamp-2">{listing.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-foreground/60">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{listing.location.city}</span>
                        </div>
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          <span>{listing.category}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="min-w-[200px]"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Features Section with Icons */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-card rounded-3xl p-12">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why Choose HyounKunun?</h2>
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

      {/* Featured Categories with Popular Items */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Popular Categories</h2>
          <p className="text-foreground/80 font-medium">Discover amazing deals in your favorite categories</p>
        </div>

        {/* Mobile Phones & Electronics */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                Mobile Phones & Electronics
              </h3>
              <p className="text-muted-foreground">Latest gadgets and electronics</p>
            </div>
            <Button variant="link" className="text-primary" onClick={() => setSelectedCategory("Mobile Phones")}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {listings.filter(listing => 
              listing.category === "Mobile Phones" || listing.category === "Electronics & Appliances"
            ).slice(0, 4).map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={listing.images[0] || "/placeholder.png"}
                      alt={listing.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                      ₹{listing.price.toLocaleString()}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium line-clamp-1">{listing.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{listing.location.city}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Vehicles */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Car className="h-6 w-6 text-primary" />
                Cars & Vehicles
              </h3>
              <p className="text-muted-foreground">Find your perfect ride</p>
            </div>
            <Button variant="link" className="text-primary" onClick={() => setSelectedCategory("Cars & Vehicles")}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {listings.filter(listing => listing.category === "Cars & Vehicles")
              .slice(0, 4).map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={listing.images[0] || "/placeholder.png"}
                      alt={listing.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                      ₹{listing.price.toLocaleString()}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium line-clamp-1">{listing.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{listing.location.city}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Property */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                Property
              </h3>
              <p className="text-muted-foreground">Homes and commercial spaces</p>
            </div>
            <Button variant="link" className="text-primary" onClick={() => setSelectedCategory("Property")}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {listings.filter(listing => listing.category === "Property")
              .slice(0, 4).map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={listing.images[0] || "/placeholder.png"}
                      alt={listing.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                      ₹{listing.price.toLocaleString()}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium line-clamp-1">{listing.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{listing.location.city}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Category Access */}
        <div className="pt-8">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-2xl font-semibold text-foreground">More Categories</h3>
            <p className="text-muted-foreground">Browse all our categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Fashion", icon: <Shirt className="h-6 w-6" />, color: "bg-pink-500" },
              { name: "Furniture", icon: <Sofa className="h-6 w-6" />, color: "bg-orange-500" },
              { name: "Books", icon: <Book className="h-6 w-6" />, color: "bg-blue-500" },
              { name: "Sports", icon: <Dumbbell className="h-6 w-6" />, color: "bg-green-500" },
              { name: "Business", icon: <Briefcase className="h-6 w-6" />, color: "bg-purple-500" },
              { name: "Education", icon: <GraduationCap className="h-6 w-6" />, color: "bg-yellow-500" }
            ].map((category) => (
              <Button
                key={category.name}
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 hover:bg-primary/5 group relative overflow-hidden"
                onClick={() => {
                  setSelectedCategory(category.name);
                  document.querySelector('#listings')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${category.color}`} />
                {category.icon}
                <span className="text-sm text-center relative z-10">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Items Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-foreground">Trending Now</h2>
          <p className="text-foreground/80 font-medium">Most viewed items this week</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {listings.slice(0, 4).map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={listing.images[0] || "/placeholder.png"}
                    alt={listing.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                    ₹{listing.price.toLocaleString()}
                  </div>
                  <div className="absolute top-2 left-2">
                    <div className="bg-white/90 text-sm px-2 py-1 rounded-md flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Trending</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium line-clamp-1">{listing.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">{listing.location.city}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4">
        <div className="bg-card rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Start?</h2>
          <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto font-medium">
            Join thousands of users making great deals every day on your fastest-growing marketplace.
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
