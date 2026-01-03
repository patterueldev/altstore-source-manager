import mongoose, { Document, Schema } from 'mongoose';

export interface IApp extends Document {
  name: string;
  bundleIdentifier: string;
  marketplaceID?: string;
  developerName: string;
  subtitle?: string;
  localizedDescription?: string;
  iconURL?: string;
  tintColor?: string;
  category?: string;
  screenshots?: string[];
  appPermissions?: any;
  patreon?: any;
  createdAt: Date;
  updatedAt: Date;
}

const AppSchema = new Schema<IApp>({
  name: {
    type: String,
    required: true,
  },
  bundleIdentifier: {
    type: String,
    required: true,
    unique: true,
  },
  marketplaceID: String,
  developerName: {
    type: String,
    required: true,
  },
  subtitle: String,
  localizedDescription: String,
  iconURL: String,
  tintColor: String,
  category: String,
  screenshots: [String],
  appPermissions: Schema.Types.Mixed,
  patreon: Schema.Types.Mixed,
}, {
  timestamps: true,
});

export const App = mongoose.model<IApp>('App', AppSchema);
