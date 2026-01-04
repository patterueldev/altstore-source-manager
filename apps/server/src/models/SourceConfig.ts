import mongoose, { Document, Schema } from 'mongoose';

export interface ISourceConfig extends Document {
  name: string;
  subtitle?: string;
  description?: string;
  iconURL?: string;
  headerURL?: string;
  website?: string;
  tintColor?: string;
  featuredApps: string[]; // Array of bundleIdentifiers
  createdAt: Date;
  updatedAt: Date;
}

const SourceConfigSchema = new Schema<ISourceConfig>(
  {
    name: {
      type: String,
      required: true,
      default: 'AltStore Source',
    },
    subtitle: {
      type: String,
    },
    description: {
      type: String,
    },
    iconURL: {
      type: String,
    },
    headerURL: {
      type: String,
    },
    website: {
      type: String,
    },
    tintColor: {
      type: String,
    },
    featuredApps: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const SourceConfig = mongoose.model<ISourceConfig>('SourceConfig', SourceConfigSchema);
