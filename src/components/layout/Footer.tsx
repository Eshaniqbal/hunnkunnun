
export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6 text-center mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kashmir Classifieds. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Connecting communities across Jammu & Kashmir.
        </p>
      </div>
    </footer>
  );
}
