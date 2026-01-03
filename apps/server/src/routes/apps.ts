import express, { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { App } from '../models/App.js';
import { Version } from '../models/Version.js';
import { authMiddleware } from '../middleware/auth.js';
import { Client as MinioClient } from 'minio';

const router: Router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for images
});

// MinIO client
const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'devadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'devsecret',
});

const ICONS_BUCKET = 'icons';
const SCREENSHOTS_BUCKET = 'screenshots';

// Get all apps (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const apps = await App.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    console.error('Get apps error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single app (protected)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.json(app);
  } catch (error) {
    console.error('Get app error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create app (authenticated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      name, bundleIdentifier, developerName, subtitle, 
      localizedDescription, iconURL, tintColor, screenshots, visible
    } = req.body;

    if (!name || !bundleIdentifier || !developerName || !iconURL || !tintColor || !localizedDescription) {
      return res.status(400).json({ error: 'Name, bundleIdentifier, developerName, iconURL, tintColor, and localizedDescription are required' });
    }

    const app = new App({
      name,
      bundleIdentifier,
      developerName,
      subtitle,
      localizedDescription,
      iconURL,
      tintColor,
      screenshots: screenshots || [],
      visible: visible !== undefined ? visible : true,
    });

    await app.save();
    res.status(201).json(app);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bundle identifier already exists' });
    }
    console.error('Create app error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update app (authenticated)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { 
      name, bundleIdentifier, developerName, subtitle, 
      localizedDescription, iconURL, tintColor, screenshots, visible
    } = req.body;
    
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    if (name) app.name = name;
    if (bundleIdentifier) app.bundleIdentifier = bundleIdentifier;
    if (developerName) app.developerName = developerName;
    if (subtitle !== undefined) app.subtitle = subtitle;
    if (localizedDescription !== undefined) app.localizedDescription = localizedDescription;
    if (iconURL !== undefined) app.iconURL = iconURL;
    if (tintColor !== undefined) app.tintColor = tintColor;
    if (screenshots !== undefined) app.screenshots = screenshots;
    if (visible !== undefined) app.visible = visible;

    await app.save();
    res.json(app);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bundle identifier already exists' });
    }
    console.error('Update app error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload app icon (authenticated)
router.post('/:id/icon', authMiddleware, upload.single('icon'), async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Icon file is required' });
    }

    const file = req.file;
    const filename = `${req.params.id}.png`;

    // Upload to MinIO
    await minioClient.putObject(ICONS_BUCKET, filename, file.buffer, file.size, {
      'Content-Type': 'image/png',
    });

    // Generate download URL
    const iconURL = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${ICONS_BUCKET}/${filename}`;

    app.iconURL = iconURL;
    await app.save();

    res.json({ iconURL });
  } catch (error) {
    console.error('Upload icon error:', error);
    res.status(500).json({ error: 'Failed to upload icon' });
  }
});

// Upload app screenshots (authenticated)
router.post('/:id/screenshots', authMiddleware, upload.array('screenshots', 10), async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Screenshot files are required' });
    }

    const files = req.files as Express.Multer.File[];
    const screenshotURLs: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = `${req.params.id}-${Date.now()}-${i}.png`;

      // Upload to MinIO
      await minioClient.putObject(SCREENSHOTS_BUCKET, filename, file.buffer, file.size, {
        'Content-Type': 'image/png',
      });

      const screenshotURL = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${SCREENSHOTS_BUCKET}/${filename}`;
      screenshotURLs.push(screenshotURL);
    }

    // Append to existing screenshots or replace
    if (!app.screenshots) {
      app.screenshots = [];
    }
    app.screenshots.push(...screenshotURLs);
    await app.save();

    res.json({ screenshots: app.screenshots });
  } catch (error) {
    console.error('Upload screenshots error:', error);
    res.status(500).json({ error: 'Failed to upload screenshots' });
  }
});

// Delete screenshot (authenticated)
router.delete('/:id/screenshots/:index', authMiddleware, async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= (app.screenshots?.length || 0)) {
      return res.status(400).json({ error: 'Invalid screenshot index' });
    }

    // Remove screenshot from array
    app.screenshots = app.screenshots?.filter((_, i) => i !== index) || [];
    await app.save();

    res.json({ screenshots: app.screenshots });
  } catch (error) {
    console.error('Delete screenshot error:', error);
    res.status(500).json({ error: 'Failed to delete screenshot' });
  }
});

// Reorder screenshots (authenticated)
router.put('/:id/screenshots/reorder', authMiddleware, async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const { screenshots } = req.body;
    if (!Array.isArray(screenshots)) {
      return res.status(400).json({ error: 'Screenshots must be an array' });
    }

    app.screenshots = screenshots;
    await app.save();

    res.json({ screenshots: app.screenshots });
  } catch (error) {
    console.error('Reorder screenshots error:', error);
    res.status(500).json({ error: 'Failed to reorder screenshots' });
  }
});

// Delete app (authenticated)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Delete all versions for this app
    await Version.deleteMany({ appId: req.params.id });
    
    await App.findByIdAndDelete(req.params.id);
    res.json({ message: 'App deleted' });
  } catch (error) {
    console.error('Delete app error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
