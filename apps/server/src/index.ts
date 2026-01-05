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
import accessKeyRoutes from './routes/accessKeys.js';
import { buildObjectUrl, getPublicBase, buildPublicUrl } from './utils/publicUrl.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@mongodb:27017/altstore?authSource=admin';

const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'devadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'devsecret',
});

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
app.use('/api/access-keys', accessKeyRoutes);

// Optional public proxy to MinIO assets (single-origin access)
app.get('/public/:bucket/*', async (req, res) => {
  const { bucket } = req.params;
  const objectKey = (req.params as Record<string, string>)['0'];

  if (!objectKey) {
    return res.status(400).json({ error: 'Object key required' });
  }

  try {
    const stat = await minioClient.statObject(bucket, objectKey);
    if (stat?.metaData) {
      const contentType = stat.metaData['content-type'] || stat.metaData['Content-Type'];
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
    }
    const stream = await minioClient.getObject(bucket, objectKey);
    stream.on('error', (err) => {
      console.error('Proxy stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream object' });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  } catch (error) {
    console.error('Proxy fetch error:', error);
    res.status(404).json({ error: 'Object not found' });
  }
});

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

const normalizeToPath = (value?: string | null) => {
  if (!value) return value || undefined;
  const stripPublic = (path: string) => path.startsWith('/public/') ? path.replace('/public/', '/') : path;

  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const url = new URL(value);
      return stripPublic(url.pathname || undefined as any);
    } catch {
      return stripPublic(value);
    }
  }
  return stripPublic(value);
};

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
      const versions = await Version.find({ appId: app._id, visible: true }).sort({ createdAt: -1 });
      
      // Transform stored paths to full URLs
      const iconURL = app.iconURL ? buildPublicUrl(app.iconURL, req) : app.iconURL;
      const screenshots = app.screenshots?.map(path => buildPublicUrl(path, req));
      
      // Only include classic format fields
      return {
        name: app.name,
        bundleIdentifier: app.bundleIdentifier,
        developerName: app.developerName,
        subtitle: app.subtitle,
        localizedDescription: app.localizedDescription,
        iconURL,
        tintColor: app.tintColor,
        screenshots,
        versions: versions.map(v => ({
          version: v.version,
          buildVersion: v.buildVersion,
          date: v.date.toISOString().split('T')[0],
          localizedDescription: v.localizedDescription,
          downloadURL: buildPublicUrl(v.downloadURL, req),
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
      iconURL: config.iconURL ? buildPublicUrl(config.iconURL, req) : config.iconURL,
      headerURL: config.headerURL ? buildPublicUrl(config.headerURL, req) : config.headerURL,
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
      iconURL: normalizeToPath(process.env.SOURCE_ICON_URL),
      headerURL: normalizeToPath(process.env.SOURCE_HEADER_URL),
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
  const buckets = ['ipas', 'icons', 'screenshots', 'source-images'];
  
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
      
      // Enable versioning for ipas bucket
      if (bucket === 'ipas') {
        await minioClient.setBucketVersioning(bucket, { Status: 'Enabled' });
        console.log(`✓ Enabled versioning for bucket: ${bucket}`);
      }
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


