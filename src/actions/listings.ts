"use server";

import { z } from "zod";
import type { Listing } from "@/types";
import { CreateListingSchema, type CreateListingInput } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import ListingModel from "@/models/Listing";
import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { Types } from 'mongoose';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app if it hasn't been initialized
const firebaseApp = initializeApp(firebaseConfig, 'listings-app');
const storage = getStorage(firebaseApp);

interface UserDetails {
  uid: string;
  name: string | null;
  email: string | null;
}

// Helper function to serialize MongoDB document
function serializeDocument(doc: any): any {
  const serialized = JSON.parse(JSON.stringify(doc));
  if (serialized._id) {
    serialized.id = serialized._id.toString();
    delete serialized._id;
  }
  delete serialized.__v;
  return serialized;
}

export async function createListing(input: CreateListingInput, user: UserDetails, imageUrls: string[]) {
  const validation = CreateListingSchema.safeParse(input);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    let errorMessage = "Invalid input data. ";
    for (const key in fieldErrors) {
      if (fieldErrors[key as keyof typeof fieldErrors]) {
        errorMessage += `${key}: ${fieldErrors[key as keyof typeof fieldErrors]!.join(', ')}. `;
      }
    }
    console.error("Validation errors:", validation.error.flatten());
    throw new Error(errorMessage.trim() || "Invalid input data.");
  }
  
  const { title, description, price, category, tags, locationAddress, locationCity, phoneNumber } = validation.data;

  try {
    // Connect to MongoDB
    await connectDB();

    // Create listing in MongoDB
    const listingData = {
      title,
      description,
      price,
      category,
      phoneNumber,
      images: imageUrls,
      tags,
      userId: user.uid,
      userName: user.name || "Anonymous User",
      userEmail: user.email || "No Email Provided",
      location: {
        address: locationAddress,
        city: locationCity,
        coordinates: null,
      },
    };

    const listing = await ListingModel.create(listingData);
    const serializedListing = serializeDocument(listing);
    
    revalidatePath("/");
    revalidatePath(`/listings/${serializedListing.id}`);
    revalidatePath("/profile");
    return serializedListing;

  } catch (error: any) {
    console.error("Error creating listing:", error);
    throw new Error(error.message || "Failed to create listing.");
  }
}

export async function getListings(filters?: { category?: string; city?: string; userId?: string }): Promise<Listing[]> {
  try {
    await connectDB();
    
    const query: any = {};
    
    if (filters?.category) {
      query.category = filters.category;
    }
    if (filters?.city) {
      query['location.city'] = filters.city;
    }
    if (filters?.userId) {
      query.userId = filters.userId;
    }
    
    const listings = await ListingModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return listings.map(listing => serializeDocument(listing));
  } catch (error) {
    console.error("Error fetching listings: ", error);
    return [];
  }
}

export async function getListingById(id: string): Promise<Listing | null> {
  try {
    await connectDB();
    
    const listing = await ListingModel.findById(id).lean();

    if (!listing) {
      return null;
    }

    return serializeDocument(listing);
  } catch (error) {
    console.error("Error fetching listing by ID: ", error);
    return null;
  }
}

export async function deleteListing(listingId: string) {
  try {
    await connectDB();
    
    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(listingId)) {
      throw new Error("Invalid listing ID format");
    }

    // Get the listing first to access its images
    const listing = await ListingModel.findById(listingId).lean();
    
    if (!listing) {
      throw new Error("Listing not found");
    }

    // Delete the listing from MongoDB
    const deletedListing = await ListingModel.findByIdAndDelete(listingId);
    
    if (!deletedListing) {
      throw new Error("Failed to delete listing");
    }

    // Delete associated images from Firebase storage if they exist
    if (listing.images && listing.images.length > 0) {
      for (const imageUrl of listing.images) {
        try {
          if (imageUrl.includes('firebase') && imageUrl.includes('/o/')) {
            // Get the image path from the URL
            const imagePath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
            const imageRef = ref(storage, imagePath);
            await deleteObject(imageRef);
          }
        } catch (error) {
          console.error("Error deleting image:", error);
          // Continue with other images even if one fails
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/profile/listings");

    return { success: true };
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
}
