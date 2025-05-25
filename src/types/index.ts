import type { Timestamp, FieldValue } from "firebase/firestore"; // Added FieldValue for serverTimestamp
import type { User as FirebaseUser } from "firebase/auth";


export interface UserProfile extends Pick<FirebaseUser, 'uid' | 'email' | 'displayName' | 'photoURL'> {
  // You can add custom fields here if needed, e.g.
  // bio?: string;
  // We can also get some metadata if available from FirebaseUser
  metadata?: FirebaseUser['metadata'];
}


export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  tags: string[];
  userId: string;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
  };
  createdAt: string;
}

export const ListingCategories = [
  "Electronics",
  "Vehicles",
  "Property",
  "Home & Garden",
  "Fashion & Accessories",
  "Books & Hobbies",
  "Services",
  "Jobs",
  "Other",
] as const;

export type ListingCategory = typeof ListingCategories[number];
