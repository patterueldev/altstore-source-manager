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
import { SourceConfig } from './models/SourceConfig.js';
import authRoutes from './routes/auth.js';
import appRoutes from './routes/apps.js';
import versionRoutes from './routes/versions.js';
import sourceConfigRoutes from './routes/sourceConfig.js';

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
app.use('/api/source-config', sourceConfigRoutes);

// Serve React dashboard at /manager
const distPath = path.join(__dirname, '../../../apps/web/dist');
app.use('/manager', express.static(distPath));

// Catch-all for React Router: serve index.html for /manager/* paths
app.get('/manager/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Filter null, undefined, and empty values recursively
function filterNull(obj: any): any {
  if (Array.isArray(obj)) {
    // Filter items and remove empties, then map each item
    const filtered = obj
      .filter(item => item !== null && item !== undefined && item !== '')
      .map(filterNull);
    // Only return array if it has items
    return filtered.length > 0 ? filtered : undefined;
  }
  if (obj !== null && typeof obj === 'object') {
    const filtered: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip null, undefined, empty string, and empty array values
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        continue;
      }
      filtered[key] = filterNull(value);
    }
    return Object.keys(filtered).length > 0 ? filtered : undefined;
  }
  return obj;
}

// Source endpoint (root path)
app.get('/', async (req, res) => {
  try {
    // Get source config from database
    let config = await SourceConfig.findOne();
    if (!config) {
      config = await new SourceConfig({
        name: process.env.SOURCE_NAME || 'AltStore Source',
      }).save();
    }

    const apps = await App.find({ visible: true });
    const sourceApps = await Promise.all(apps.map(async (app) => {
      const versions = await Version.find({ appId: app._id, visible: true }).sort({ date: -1 });
      
      // Only include classic format fields
      return {
        name: app.name,
        bundleIdentifier: app.bundleIdentifier,
        developerName: app.developerName,
        subtitle: app.subtitle,
        localizedDescription: app.localizedDescription,
        iconURL: app.iconURL,
        tintColor: app.tintColor,
        screenshots: app.screenshots,
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

    // Filter featuredApps to only include existing bundleIdentifiers
    const existingBundleIds = sourceApps.map(app => app.bundleIdentifier);
    const validFeaturedApps = config.featuredApps.filter(bundleId => 
      existingBundleIds.includes(bundleId)
    );

    const source = {
      name: config.name,
      subtitle: config.subtitle,
      description: config.description,
      iconURL: config.iconURL,
      headerURL: config.headerURL,
      website: config.website,
      tintColor: config.tintColor,
      featuredApps: validFeaturedApps,
      apps: sourceApps,
      news: [],
    };

    // Filter null/empty values
    const filteredSource = filterNull(source);

    res.json(filteredSource);
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
// Initialize source config
async function initializeSourceConfig() {
  try {
    const existingConfig = await SourceConfig.findOne();
    if (existingConfig) {
      console.log('Source config already exists');
      return;
    }

    const config = new SourceConfig({
      name: process.env.SOURCE_NAME || 'AltStore Source',
      subtitle: process.env.SOURCE_SUBTITLE,
      description: process.env.SOURCE_DESCRIPTION,
      iconURL: process.env.SOURCE_ICON_URL,
      headerURL: process.env.SOURCE_HEADER_URL,
      website: process.env.SOURCE_WEBSITE,
      tintColor: process.env.SOURCE_TINT_COLOR,
      featuredApps: process.env.SOURCE_FEATURED_APPS?.split(',').filter(Boolean) || [],
    });

    await config.save();
    console.log('✓ Source config initialized');
  } catch (error) {
    console.error('Failed to initialize source config:', error);
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

  const buckets = ['ipas', 'icons', 'screenshots'];
  
  for (const bucket of buckets) {
    try {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        console.log(`✓ Created MinIO bucket: ${bucket}`);
      } else {
        console.log(`✓ MinIO bucket exists: ${bucket}`);
      }

      // Set public read policy for the bucket
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
      console.log(`✓ Set public read policy for bucket: ${bucket}`);
    } catch (error) {
      console.error(`Failed to initialize bucket ${bucket}:`, error);
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

    // Initialize source config
    await initializeSourceConfig();

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


