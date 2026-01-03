import mongoose, { Document, Schema } from 'mongoose';

export interface IVersion extends Document {
  appId: mongoose.Types.ObjectId;
  version: string;
  buildVersion: string;
  date: Date;
  localizedDescription?: string;
  downloadURL: string;
  size: number;
  minOSVersion: string;
  maxOSVersion?: string;
  sha256: string;
  screenshots?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VersionSchema = new Schema<IVersion>({
  appId: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
  buildVersion: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  localizedDescription: String,
  downloadURL: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  minOSVersion: {
    type: String,
    required: true,
  },
  maxOSVersion: String,
  sha256: {
    type: String,
    required: true,
  },
  screenshots: [String],
}, {
  timestamps: true,
});

// Compound index to ensure unique version per app
VersionSchema.index({ appId: 1, version: 1 }, { unique: true });

export const Version = mongoose.model<IVersion>('Version', VersionSchema);
