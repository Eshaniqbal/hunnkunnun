
import ListingsGrid from "@/components/listings/ListingsGrid";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="text-center pt-8 pb-4"> {/* Adjusted padding */}
        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Discover Local Listings in Kashmir</h1>
        <p className="mt-2 text-md md:text-lg text-muted-foreground">Buy, sell, and connect with your community.</p>
      </header>
      <ListingsGrid />
    </div>
  );
}
