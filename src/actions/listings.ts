
"use server";

import { z } from "zod";
import { collection, addDoc, getDocs, doc, getDoc, query, where, Timestamp, orderBy, serverTimestamp, FieldValue } from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase"; // Removed auth import as it's client-side
import type { Listing } from "@/types";
import { CreateListingSchema, type CreateListingInput, dataURLMimeType } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

interface UserDetails {
  uid: string;
  name: string | null;
  email: string | null;
}

export async function createListing(input: CreateListingInput, user: UserDetails) {
  const validation = CreateListingSchema.safeParse(input);
  if (!validation.success) {
    // Construct a more detailed error message
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
  
  const { title, description, price, category, tags, locationAddress, locationCity, images: imageDataUris } = validation.data;

  const imageUrls: string[] = [];
  try {
    for (const [index, dataUri] of imageDataUris.entries()) {
      const mimeType = dataURLMimeType(dataUri);
      // Fallback to 'png' if mimeType is generic or split fails
      const extension = mimeType.startsWith('image/') ? mimeType.split('/')[1] || 'png' : 'png';
      const imageRef = ref(storage, `listings/${user.uid}/${Date.now()}_${index}.${extension}`);
      await uploadString(imageRef, dataUri, 'data_url');
      const downloadURL = await getDownloadURL(imageRef);
      imageUrls.push(downloadURL);
    }

    const listingData: Omit<Listing, "id" | "createdAt"> & { createdAt: FieldValue } = {
      title,
      description,
      price,
      category,
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
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "listings"), listingData);
    
    revalidatePath("/");
    revalidatePath(`/listings/${docRef.id}`);
    revalidatePath("/profile"); // Also revalidate profile page if user's listings are shown there
    return { id: docRef.id };

  } catch (error: any) {
    console.error("Error creating listing:", error);
    // Attempt to clean up uploaded images if listing creation fails
    for(const url of imageUrls) {
        try {
            const imageStorageRef = ref(storage, url); // Use ref(storage, url) to get the reference
            await deleteObject(imageStorageRef);
        } catch (cleanupError) {
            console.error("Error cleaning up image:", url, cleanupError);
        }
    }
    throw new Error(error.message || "Failed to create listing.");
  }
}


export async function getListings(filters?: { category?: string; city?: string; userId?: string }): Promise<Listing[]> {
  try {
    const listingsCol = collection(db, "listings");
    const qConstraints: any[] = [orderBy("createdAt", "desc")]; // Use any[] for qConstraints temporarily

    if (filters?.category) {
      qConstraints.push(where("category", "==", filters.category));
    }
    if (filters?.city) {
      // For case-insensitive search, this would require more complex querying or data duplication (e.g. lowercase city field)
      // Firestore's default string comparisons are case-sensitive.
      // For simplicity, we'll keep it case-sensitive for now.
      qConstraints.push(where("location.city", "==", filters.city));
    }
    if (filters?.userId) {
      qConstraints.push(where("userId", "==", filters.userId));
    }
    
    const q = query(listingsCol, ...qConstraints);
    const querySnapshot = await getDocs(q);
    
    const listings = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Ensure createdAt is properly cast to Timestamp if it's not already
        // or handle cases where it might be a FieldValue (serverTimestamp()) before commit.
        // For fetched data, it should be a Timestamp.
        createdAt: data.createdAt as Timestamp 
      } as Listing;
    });
    return listings;
  } catch (error) {
    console.error("Error fetching listings: ", error);
    return [];
  }
}

export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const docRef = doc(db, "listings", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data, 
        createdAt: data.createdAt as Timestamp 
      } as Listing;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching listing by ID: ", error);
    return null;
  }
}
