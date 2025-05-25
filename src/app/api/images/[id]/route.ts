import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const MONGODB_URI = process.env.MONGODB_URI;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();
  const bucket = new GridFSBucket(db);

  try {
    // Find the file metadata
    const files = await bucket.find({ _id: new ObjectId(params.id) }).toArray();
    if (!files.length) {
      await client.close();
      return new NextResponse('Image not found', { status: 404 });
    }

    const file = files[0];

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', file.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Create a transform stream
    const chunks: Buffer[] = [];
    const downloadStream = bucket.openDownloadStream(new ObjectId(params.id));

    // Read the file data
    for await (const chunk of downloadStream) {
      chunks.push(Buffer.from(chunk));
    }

    // Combine all chunks into a single buffer
    const buffer = Buffer.concat(chunks);

    await client.close();
    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Error serving image:', error);
    await client.close();
    return new NextResponse('Error serving image', { status: 500 });
  }
} 