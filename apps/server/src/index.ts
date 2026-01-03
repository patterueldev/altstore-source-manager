import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Client as MinioClient } from 'minio';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';
import { App } from './models/App.js';
import { Version } from './models/Version.js';
import authRoutes from './routes/auth.js';
import appRoutes from './routes/apps.js';
import versionRoutes from './routes/versions.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@mongodb:27017/altstore?authSource=admin';

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../../../openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn('Failed to load OpenAPI spec:', error);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/versions', versionRoutes);

// Placeholder: Source JSON endpoint
app.get('/source.json', async (req, res) => {
  try {
    const apps = await App.find();
    const sourceApps = await Promise.all(apps.map(async (app) => {
      const versions = await Version.find({ appId: app._id }).sort({ date: -1 });
      
      return {
        name: app.name,
        bundleIdentifier: app.bundleIdentifier,
        marketplaceID: app.marketplaceID,
        developerName: app.developerName,
        subtitle: app.subtitle,
        localizedDescription: app.localizedDescription,
        iconURL: app.iconURL,
        tintColor: app.tintColor,
        category: app.category,
        screenshots: app.screenshots,
        appPermissions: app.appPermissions,
        patreon: app.patreon,
        versions: versions.map(v => ({
          version: v.version,
          buildVersion: v.buildVersion,
          date: v.date.toISOString().split('T')[0],
          localizedDescription: v.localizedDescription,
          downloadURL: v.downloadURL,
          size: v.size,
          minOSVersion: v.minOSVersion,
          maxOSVersion: v.maxOSVersion,
          sha256: v.sha256,
        })),
      };
    }));

    res.json({
      name: process.env.SOURCE_NAME || 'AltStore Source',
      subtitle: process.env.SOURCE_SUBTITLE,
      description: process.env.SOURCE_DESCRIPTION,
      iconURL: process.env.SOURCE_ICON_URL,
      headerURL: process.env.SOURCE_HEADER_URL,
      website: process.env.SOURCE_WEBSITE,
      patreonURL: process.env.SOURCE_PATREON_URL,
      tintColor: process.env.SOURCE_TINT_COLOR,
      identifier: process.env.SOURCE_IDENTIFIER || 'com.example.source',
      featuredApps: process.env.SOURCE_FEATURED_APPS?.split(',').filter(Boolean) || [],
      apps: sourceApps,
      news: [],
    });
  } catch (error) {
    console.error('Source generation error:', error);
    res.status(500).json({ error: 'Failed to generate source' });
  }
});

// Initialize admin user
async function initializeAdmin() {
  try {
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    const password = crypto.randomBytes(16).toString('hex');
    const admin = new User({
      username: 'admin',
      password,
    });

    await admin.save();
    console.log('\n========================================');
    console.log('ADMIN CREDENTIALS');
    console.log('========================================');
    console.log(`Username: admin`);
    console.log(`Password: ${password}`);
    console.log('========================================\n');
  } catch (error) {
    console.error('Failed to initialize admin user:', error);
  }
}

// Initialize MinIO buckets
async function initializeMinIO() {
  const minioClient = new MinioClient({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'devadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'devsecret',
  });

  const buckets = ['ipas', 'icons'];
  
  for (const bucket of buckets) {
    try {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        console.log(`✓ Created MinIO bucket: ${bucket}`);
      } else {
        console.log(`✓ MinIO bucket exists: ${bucket}`);
      }
    } catch (error) {
      console.error(`Failed to create bucket ${bucket}:`, error);
    }
  }
}

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Initialize MinIO buckets
    await initializeMinIO();

    // Initialize admin user
    await initializeAdmin();

    // Start listening
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


