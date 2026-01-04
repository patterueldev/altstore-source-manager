import mongoose, { Document, Schema } from 'mongoose';

export interface IApp extends Document {
  name: string;
  bundleIdentifier: string;
  developerName: string;
  iconURL: string;
  tintColor: string;
  localizedDescription: string;
  subtitle?: string;
  screenshots?: string[];
  visible: boolean;
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
  localizedDescription: {
    type: String,
    required: true,
  },
  screenshots: [String],
  visible: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const App = mongoose.model<IApp>('App', AppSchema);
