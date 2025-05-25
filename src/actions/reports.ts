"use server";

import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";

export async function reportListing(
  listingId: string,
  reason: string,
  description: string
) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be logged in to report a listing");
    }

    // Create the report
    await db.collection("reports").add({
      listingId,
      reason,
      description,
      reportedBy: currentUser.email,
      status: "pending", // pending, reviewed, resolved
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update the listing with report count
    const listingRef = db.collection("listings").doc(listingId);
    await db.runTransaction(async (transaction) => {
      const listing = await transaction.get(listingRef);
      if (!listing.exists) {
        throw new Error("Listing not found");
      }

      const reportCount = (listing.data()?.reportCount || 0) + 1;
      transaction.update(listingRef, {
        reportCount,
        // If report count is high, mark for review
        status: reportCount >= 3 ? "underReview" : listing.data()?.status,
        updatedAt: new Date(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error reporting listing:", error);
    throw error;
  }
} 