"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Mail, Phone } from "lucide-react";
import { ListingCategories } from "@/types";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K</span>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground text-[10px]">M</span>
                </div>
              </div>
              <h3 className="font-bold text-lg text-foreground">KashurMart</h3>
            </div>
            <p className="text-sm text-foreground/80">
              Kashmir's trusted marketplace for buying and selling pre-owned items. Connect with local sellers and find amazing deals.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-foreground/80">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Kashmir, India</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-foreground/80">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:contact@kashurmart.com" className="hover:text-primary">contact@kashurmart.com</a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-foreground/80">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+911234567890" className="hover:text-primary">+91 123 456 7890</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-foreground/80 hover:text-primary">About Us</Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-foreground/80 hover:text-primary">How It Works</Link>
              </li>
              <li>
                <Link href="/safety" className="text-foreground/80 hover:text-primary">Safety Tips</Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/80 hover:text-primary">Contact Us</Link>
              </li>
              <li>
                <Link href="/faqs" className="text-foreground/80 hover:text-primary">FAQs</Link>
              </li>
              <li>
                <Link href="/blog" className="text-foreground/80 hover:text-primary">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Categories</h3>
            <ul className="space-y-2 text-sm">
              {ListingCategories.slice(0, 6).map((category) => (
                <li key={category}>
                  <Link href={`/categories/${category.toLowerCase()}`} className="text-foreground/80 hover:text-primary">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-foreground/80 hover:text-primary">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-foreground/80 hover:text-primary">Terms of Service</Link>
              </li>
              <li>
                <Link href="/cookies" className="text-foreground/80 hover:text-primary">Cookie Policy</Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-foreground/80 hover:text-primary">Sitemap</Link>
              </li>
            </ul>

            <div className="pt-4">
              <h3 className="font-bold text-lg text-foreground mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                   className="text-foreground/80 hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                   className="text-foreground/80 hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                   className="text-foreground/80 hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                   className="text-foreground/80 hover:text-primary">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left">
            <p className="text-sm text-foreground/80">
              © {currentYear} KashurMart. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-4 text-sm text-foreground/80">
              <span>Made with ❤️ in Kashmir</span>
              <span className="hidden sm:inline">•</span>
              <Link href="/support" className="hover:text-primary">Support</Link>
              <span className="hidden sm:inline">•</span>
              <Link href="/feedback" className="hover:text-primary">Feedback</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
