import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IAccessKey extends Document {
  userId: mongoose.Types.ObjectId;
  key: string; // public key identifier
  secret: string; // bcrypt-hashed secret
  name: string;
  createdAt: Date;
  lastUsedAt?: Date;
  active: boolean;
  compareSecret(providedSecret: string): Promise<boolean>;
}

const AccessKeySchema = new Schema<IAccessKey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    secret: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash secret before saving if modified
AccessKeySchema.pre('save', async function (next) {
  if (!this.isModified('secret')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.secret = await bcrypt.hash(this.secret, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare provided secret with stored hash
AccessKeySchema.methods.compareSecret = async function (
  providedSecret: string
): Promise<boolean> {
  return bcrypt.compare(providedSecret, this.secret);
};

// Static method to generate a new access key pair
AccessKeySchema.statics.generateKeyPair = function (): {
  key: string;
  secret: string;
} {
  const key = `ak_${crypto.randomBytes(12).toString('hex')}`;
  const secret = crypto.randomBytes(32).toString('hex');
  return { key, secret };
};

export default mongoose.model<IAccessKey>('AccessKey', AccessKeySchema);
