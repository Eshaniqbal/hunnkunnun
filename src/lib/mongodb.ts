import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

// Validate MongoDB URI format
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  throw new Error('Invalid MongoDB URI format. URI must start with "mongodb://" or "mongodb+srv://"');
}

let clientPromise: Promise<typeof mongoose> | null = null;

async function connectDB() {
  try {
    if (!clientPromise) {
      const opts = {
        bufferCommands: false,
      };

      clientPromise = mongoose.connect(MONGODB_URI, opts);
    }

    const client = await clientPromise;
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    clientPromise = null;
    throw new Error('Failed to connect to MongoDB. Please check your connection string and network connection.');
  }
}

export default connectDB; 