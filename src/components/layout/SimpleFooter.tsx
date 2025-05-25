"use client";

export default function SimpleFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-4">
        <p className="text-sm text-center text-foreground/80">
          © {currentYear} Hunnkunnun. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 