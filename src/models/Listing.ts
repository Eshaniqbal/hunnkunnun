import mongoose from 'mongoose';
import { ListingCategories } from '@/types';

// Delete the model if it exists to force schema refresh
if (mongoose.models.Listing) {
  delete mongoose.models.Listing;
}

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 5000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ListingCategories,
    validate: {
      validator: function(v: string) {
        return ListingCategories.includes(v as any);
      },
      message: props => `${props.value} is not a valid category`
    }
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^\+?[1-9]\d{9,11}$/, 'Please enter a valid phone number'],
  },
  images: {
    type: [String],
    required: true,
    validate: [(val: string[]) => val.length > 0 && val.length <= 5, 'Must have between 1 and 5 images'],
  },
  tags: {
    type: [String],
    validate: [(val: string[]) => val.length <= 10, 'Maximum 10 tags allowed'],
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  location: {
    address: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 200,
    },
    city: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    coordinates: {
      type: {
        lat: Number,
        lng: Number,
      },
      required: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better query performance
listingSchema.index({ category: 1 });
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ userId: 1 });
listingSchema.index({ createdAt: -1 });

// Create text index for search functionality
listingSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);

export default Listing; 