import mongoose from 'mongoose';

if (mongoose.models.UserStats) {
  delete mongoose.models.UserStats;
}

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  freeListingsCount: {
    type: Number,
    default: 0,
  },
  paidListingsCount: {
    type: Number,
    default: 0,
  },
  totalPaidAmount: {
    type: Number,
    default: 0,
  },
  lastPaymentDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
userStatsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes
userStatsSchema.index({ userId: 1 });
userStatsSchema.index({ createdAt: -1 });

const UserStats = mongoose.models.UserStats || mongoose.model('UserStats', userStatsSchema);

export default UserStats; 