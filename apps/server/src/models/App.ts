import mongoose, { Document, Schema } from 'mongoose';

export interface IApp extends Document {
  name: string;
  bundleIdentifier: string;
  developerName: string;
  subtitle?: string;
  localizedDescription?: string;
  iconURL?: string;
  tintColor?: string;
  screenshotURLs?: string[];
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
  developerName: {
    type: String,
    required: true,
  },
  subtitle: String,
  localizedDescription: String,
  iconURL: String,
  tintColor: String,
  screenshotURLs: [String],
}, {
  timestamps: true,
});

export const App = mongoose.model<IApp>('App', AppSchema);
