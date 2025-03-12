import mongoose from 'mongoose';

const subAccountSettingsSchema = new mongoose.Schema({
  subAccountId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  flodeskApiKey: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

subAccountSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const SubAccountSettings = mongoose.model('SubAccountSettings', subAccountSettingsSchema); 