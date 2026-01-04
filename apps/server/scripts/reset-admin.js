#!/usr/bin/env node

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/altstore?authSource=admin';

// User Schema (simplified from the main app)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

async function resetAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully\n');

    // Generate new password
    const newPassword = crypto.randomBytes(16).toString('hex');

    // Find and update or create admin user
    let admin = await User.findOne({ username: 'admin' });
    
    if (admin) {
      admin.password = newPassword;
      await admin.save();
      console.log('✓ Admin password reset successfully\n');
    } else {
      admin = new User({
        username: 'admin',
        password: newPassword,
      });
      await admin.save();
      console.log('✓ Admin user created successfully\n');
    }

    console.log('========================================');
    console.log('ADMIN CREDENTIALS');
    console.log('========================================');
    console.log(`Username: admin`);
    console.log(`Password: ${newPassword}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('Error resetting admin password:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

resetAdmin();
