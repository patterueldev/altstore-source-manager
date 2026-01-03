import mongoose, { Document, Schema } from 'mongoose';

export interface IApp extends Document {
  name: string;
  bundleIdentifier: string;
  developerName: string;
  iconURL: string;
  tintColor: string;
  subtitle?: string;
  localizedDescription?: string;
  screenshots?: string[];
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
  iconURL: {
    type: String,
    required: true,
  },
  tintColor: {
    type: String,
    required: true,
  },
  subtitle: String,
  localizedDescription: String,
  screenshots: [String],
}, {
  timestamps: true,
});

export const App = mongoose.model<IApp>('App', AppSchema);
