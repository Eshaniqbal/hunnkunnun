import { z } from "zod";
import type { ListingCategory } from "@/types";
import { ListingCategories } from "@/types";

export const MAX_IMAGES = 5;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const dataURLMimeType = (dataURL: string) => {
  const match = dataURL.match(/^data:(image\/[^;]+);base64,/);
  return match ? match[1] : 'application/octet-stream'; // Default MIME type if not found
};

export const CreateListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description must be less than 5000 characters"),
  price: z.string().or(z.number()).transform(val => Number(val)),
  category: z.enum(ListingCategories as readonly string[], {
    required_error: "Please select a category",
    invalid_type_error: "Invalid category type",
    description: "Category must be one of the predefined listing categories"
  }),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,11}$/, "Please enter a valid phone number"),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed"),
  locationAddress: z.string().min(5, "Address must be at least 5 characters").max(200, "Address must be less than 200 characters"),
  locationCity: z.string().min(2, "City must be at least 2 characters").max(50, "City must be less than 50 characters"),
  images: z.array(
    z.string()
      .refine((dataUri) => dataUri.startsWith("data:image/"), "Invalid image format (must be data URI starting with 'data:image/').")
      .refine((dataUri) => {
        const base64Data = dataUri.substring(dataUri.indexOf(',') + 1);
        if (!base64Data) return false; // Handle empty base64 string
        // Approximate byte length calculation for base64
        const padding = dataUri.endsWith('==') ? 2 : dataUri.endsWith('=') ? 1 : 0;
        const byteLength = (base64Data.length * 3 / 4) - padding;
        return byteLength > 0 && byteLength <= MAX_IMAGE_SIZE_BYTES;
      }, `Image size must be less than ${MAX_IMAGE_SIZE_MB}MB and not empty.`)
  ).min(1, "At least one image is required").max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images allowed.`),
  isPaid: z.boolean().optional().default(false),
  paymentId: z.string().optional(),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
