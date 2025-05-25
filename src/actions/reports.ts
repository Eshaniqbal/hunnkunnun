"use server";

import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";

export async function reportListing(
  listingId: string,
  reason: string,
  description: string,
  userEmail?: string | null
) {
  try {
    if (!userEmail) {
      throw new Error("You must be logged in to report a listing");
    }

    // Create the report
    await db.collection("reports").add({
      listingId,
      reason,
      description,
      reportedBy: userEmail,
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

    return { success: true, message: "Report submitted successfully" };
  } catch (error: any) {
    console.error("Error reporting listing:", {
      error: error.message,
      stack: error.stack,
      listingId,
      reason
    });
    
    if (error.message.includes("logged in")) {
      throw new Error("Please log in to report this listing");
    }
    
    throw new Error(error.message || "Failed to submit report. Please try again.");
  }
} 