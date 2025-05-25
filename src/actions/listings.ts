
"use server";

import { z } from "zod";
import { collection, addDoc, getDocs, doc, getDoc, query, where, Timestamp, orderBy, serverTimestamp, FieldValue } from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase";
import type { Listing, ListingCategory } from "@/types";
import { ListingCategories } from "@/types";
import { revalidatePath } from "next/cache";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const dataURLMimeType = (dataURL: string) => dataURL.substring(dataURL.indexOf(':') + 1, dataURL.indexOf(';'));

export const CreateListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.custom<ListingCategory>((val) => ListingCategories.includes(val as ListingCategory), {
    message: "Invalid category selected.",
  }),
  tags: z.array(z.string().min(1).max(30)).max(10, "Maximum 10 tags allowed, each up to 30 characters."),
  locationAddress: z.string().min(5, "Address must be at least 5 characters").max(200),
  locationCity: z.string().min(2, "City must be at least 2 characters").max(50),
  images: z.array(
    z.string().refine((dataUri) => dataUri.startsWith("data:image/"), "Invalid image format (must be data URI starting with 'data:image/').")
      .refine((dataUri) => {
          const base64Data = dataUri.substring(dataUri.indexOf(',') + 1);
          const byteLength = (base64Data.length * 3) / 4 - (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);
          return byteLength <= MAX_IMAGE_SIZE_BYTES;
      }, `Image size must be less than ${MAX_IMAGE_SIZE_MB}MB.`)
  ).min(1, "At least one image is required").max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images allowed.`),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;

export async function createListing(input: CreateListingInput) {
  // This server action should ideally get the user from a secure source like a session
  // For Firebase, auth.currentUser is typically client-side.
  // A common pattern is to pass the UID from an authenticated client, 
  // or use Firebase Admin SDK if this were a backend endpoint.
  // For this example, we'll assume it's called from a context where auth is checked.
  // A more robust solution would involve verifying the user token or using callable functions.
  
  // The prompt doesn't specify how auth is passed to server actions, 
  // so we'll rely on the AuthGuard on the client for now.
  // This is a simplification for the context of this exercise.
  // In a real app, ensure user is properly authenticated server-side for mutations.

  const validation = CreateListingSchema.safeParse(input);
  if (!validation.success) {
    console.error("Validation errors:", validation.error.flatten().fieldErrors);
    throw new Error(validation.error.flatten().fieldErrors._errors.join('\n') || "Invalid input data.");
  }
  
  // Temp: Get user details. THIS IS NOT SECURE FOR PRODUCTION SERVER ACTIONS without proper auth.
  // Will need to be replaced by proper auth token verification or session management.
  // For now, let's assume the client ensures only an authenticated user can call this.
  // This needs a user object passed or fetched securely. For now, we'll mock it for structure.
  const mockUserId = "mockUserId"; // Placeholder
  const mockUserName = "Mock User"; // Placeholder
  const mockUserEmail = "mock@example.com"; // Placeholder


  const { title, description, price, category, tags, locationAddress, locationCity, images: imageDataUris } = validation.data;

  const imageUrls: string[] = [];
  try {
    for (const [index, dataUri] of imageDataUris.entries()) {
      const mimeType = dataURLMimeType(dataUri);
      const extension = mimeType.split('/')[1] || 'png'; // Default to png if split fails
      const imageRef = ref(storage, `listings/${mockUserId}/${Date.now()}_${index}.${extension}`);
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
      userId: mockUserId, 
      userName: mockUserName, 
      userEmail: mockUserEmail,
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
    return { id: docRef.id };

  } catch (error: any) {
    console.error("Error creating listing:", error);
    for(const url of imageUrls) {
        try {
            const imageRef = ref(storage, url);
            await deleteObject(imageRef);
        } catch (cleanupError) {
            console.error("Error cleaning up image:", cleanupError);
        }
    }
    throw new Error(error.message || "Failed to create listing.");
  }
}


export async function getListings(filters?: { category?: string; city?: string; userId?: string }): Promise<Listing[]> {
  try {
    const listingsCol = collection(db, "listings");
    let qConstraints = [orderBy("createdAt", "desc")];

    if (filters?.category) {
      qConstraints.push(where("category", "==", filters.category));
    }
    if (filters?.city) {
      qConstraints.push(where("location.city", "==", filters.city));
    }
    if (filters?.userId) {
      qConstraints.push(where("userId", "==", filters.userId));
    }
    
    const q = query(listingsCol, ...qConstraints);
    const querySnapshot = await getDocs(q);
    
    const listings = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: (docSnap.data().createdAt as Timestamp) 
    } as Listing));
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
        createdAt: (data.createdAt as Timestamp) 
      } as Listing;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching listing by ID: ", error);
    return null;
  }
}
