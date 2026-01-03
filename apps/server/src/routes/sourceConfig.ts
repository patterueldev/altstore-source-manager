import express, { Router } from 'express';
import multer from 'multer';
import { SourceConfig } from '../models/SourceConfig.js';
import { authMiddleware } from '../middleware/auth.js';
import { Client as MinioClient } from 'minio';

const router: Router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG images are allowed'));
    }
  },
});

// MinIO client
const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'devadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'devsecret',
});

const SOURCE_IMAGES_BUCKET = 'source-images';

// Get source config
router.get('/', authMiddleware, async (req, res) => {
  try {
    let config = await SourceConfig.findOne();
    
    // Create default config if none exists
    if (!config) {
      config = new SourceConfig({
        name: 'AltStore Source',
        featuredApps: [],
      });
      await config.save();
    }
    
    res.json(config);
  } catch (error) {
    console.error('Get source config error:', error);
    res.status(500).json({ error: 'Failed to get source config' });
  }
});

// Update source config
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, subtitle, description, iconURL, headerURL, website, tintColor, featuredApps } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Validate URLs if provided
    const urlFields = [
      { field: 'iconURL', value: iconURL },
      { field: 'headerURL', value: headerURL },
      { field: 'website', value: website },
    ];
    
    for (const { field, value } of urlFields) {
      if (value && value.trim()) {
        try {
          new URL(value);
        } catch (e) {
          return res.status(400).json({ error: `Invalid ${field} format` });
        }
      }
    }
    
    let config = await SourceConfig.findOne();
    
    if (!config) {
      config = new SourceConfig({ name });
    } else {
      config.name = name;
    }
    
    // Update optional fields
    config.subtitle = subtitle || undefined;
    config.description = description || undefined;
    config.iconURL = iconURL || undefined;
    config.headerURL = headerURL || undefined;
    config.website = website || undefined;
    config.tintColor = tintColor || undefined;
    config.featuredApps = featuredApps || [];
    
    await config.save();
    res.json(config);
  } catch (error) {
    console.error('Update source config error:', error);
    res.status(500).json({ error: 'Failed to update source config' });
  }
});

// Upload source icon (authenticated)
router.post('/icon', authMiddleware, upload.single('icon'), async (req, res) => {
  try {
    let config = await SourceConfig.findOne();
    if (!config) {
      return res.status(404).json({ error: 'Source config not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Icon file is required' });
    }

    const file = req.file;
    const filename = 'icon.png';

    // Upload to MinIO
    await minioClient.putObject(SOURCE_IMAGES_BUCKET, filename, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    // Generate download URL
    const iconURL = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${SOURCE_IMAGES_BUCKET}/${filename}`;

    // Update config
    config.iconURL = iconURL;
    await config.save();

    res.json({ iconURL });
  } catch (error) {
    console.error('Upload source icon error:', error);
    res.status(500).json({ error: 'Failed to upload icon' });
  }
});

// Upload source header (authenticated)
router.post('/header', authMiddleware, upload.single('header'), async (req, res) => {
  try {
    let config = await SourceConfig.findOne();
    if (!config) {
      return res.status(404).json({ error: 'Source config not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Header file is required' });
    }

    const file = req.file;
    const filename = 'header.png';

    // Upload to MinIO
    await minioClient.putObject(SOURCE_IMAGES_BUCKET, filename, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    // Generate download URL
    const headerURL = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${SOURCE_IMAGES_BUCKET}/${filename}`;

    // Update config
    config.headerURL = headerURL;
    await config.save();

    res.json({ headerURL });
  } catch (error) {
    console.error('Upload source header error:', error);
    res.status(500).json({ error: 'Failed to upload header' });
  }
});

export default router;
