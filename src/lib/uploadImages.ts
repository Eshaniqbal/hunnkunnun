"use server";

import { MongoClient, GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const MONGODB_URI = process.env.MONGODB_URI;

export async function uploadImages(imageDataUris: string[]): Promise<string[]> {
  let client: MongoClient | null = null;
  const imageUrls: string[] = [];

  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const bucket = new GridFSBucket(db);

    for (const [index, dataUri] of imageDataUris.entries()) {
      try {
        // Extract the base64 data and file type
        const matches = dataUri.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          throw new Error(`Invalid data URI format for image ${index + 1}`);
        }

        const [, mimeType, base64Data] = matches;
        
        // Validate mime type
        if (!mimeType.startsWith('image/')) {
          throw new Error(`Invalid file type for image ${index + 1}. Only images are allowed.`);
        }

        const buffer = Buffer.from(base64Data, 'base64');
        
        // Validate file size (5MB limit)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error(`Image ${index + 1} exceeds 5MB size limit`);
        }

        const extension = mimeType.split('/')[1] || 'png';
        const filename = `${Date.now()}_${index}.${extension}`;

        // Create a readable stream from the buffer
        const stream = Readable.from(buffer);

        // Upload to GridFS
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: mimeType,
          metadata: {
            uploadDate: new Date(),
            size: buffer.length,
          },
        });

        await new Promise((resolve, reject) => {
          stream.pipe(uploadStream)
            .on('error', (error) => reject(new Error(`Failed to upload image ${index + 1}: ${error.message}`)))
            .on('finish', () => {
              const imageUrl = `/api/images/${uploadStream.id}`;
              imageUrls.push(imageUrl);
              resolve(imageUrl);
            });
        });
      } catch (error) {
        // Log the error and continue with next image
        console.error(`Error uploading image ${index + 1}:`, error);
        throw error; // Re-throw to be caught by outer try-catch
      }
    }

    return imageUrls;
  } catch (error) {
    console.error('Error in uploadImages:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload images');
  } finally {
    if (client) {
      await client.close();
    }
  }
} 