import express, { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { Version } from '../models/Version.js';
import { App } from '../models/App.js';
import { authMiddleware } from '../middleware/auth.js';
import { Client as MinioClient } from 'minio';

const router: Router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// MinIO client
const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'devadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'devsecret',
});

const BUCKET_NAME = 'ipas';

// Get all versions for an app
router.get('/app/:appId', async (req, res) => {
  try {
    const versions = await Version.find({ appId: req.params.appId }).sort({ date: -1 });
    res.json(versions);
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single version
router.get('/:id', async (req, res) => {
  try {
    const version = await Version.findById(req.params.id);
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }
    res.json(version);
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create version with IPA upload (authenticated)
router.post('/', authMiddleware, upload.single('ipa'), async (req, res) => {
  try {
    const { appId, version, buildVersion, date, localizedDescription, minOSVersion, maxOSVersion } = req.body;

    if (!appId || !version || !date || !minOSVersion) {
      return res.status(400).json({ error: 'appId, version, date, and minOSVersion are required' });
    }

    // Verify app exists
    const app = await App.findById(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'IPA file is required' });
    }

    const file = req.file;
    const fileBuffer = file.buffer;
    const fileSize = file.size;

    // Calculate SHA256
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    const sha256 = hash.digest('hex');

    // Generate unique filename
    const filename = `${app.bundleIdentifier}-${version}-${Date.now()}.ipa`;

    // Upload to MinIO
    await minioClient.putObject(BUCKET_NAME, filename, fileBuffer, fileSize, {
      'Content-Type': 'application/octet-stream',
    });

    // Generate download URL
    const downloadURL = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${BUCKET_NAME}/${filename}`;

    // Create version record
    const versionDoc = new Version({
      appId,
      version,
      buildVersion,
      date: new Date(date),
      localizedDescription,
      downloadURL,
      size: fileSize,
      minOSVersion,
      maxOSVersion,
      sha256,
    });

    await versionDoc.save();
    res.status(201).json(versionDoc);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Version already exists for this app' });
    }
    console.error('Create version error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update version (authenticated)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { version, buildVersion, date, localizedDescription, minOSVersion, maxOSVersion } = req.body;
    
    const versionDoc = await Version.findById(req.params.id);
    if (!versionDoc) {
      return res.status(404).json({ error: 'Version not found' });
    }

    if (version) versionDoc.version = version;
    if (buildVersion !== undefined) versionDoc.buildVersion = buildVersion;
    if (date) versionDoc.date = new Date(date);
    if (localizedDescription !== undefined) versionDoc.localizedDescription = localizedDescription;
    if (minOSVersion) versionDoc.minOSVersion = minOSVersion;
    if (maxOSVersion !== undefined) versionDoc.maxOSVersion = maxOSVersion;

    await versionDoc.save();
    res.json(versionDoc);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Version already exists for this app' });
    }
    console.error('Update version error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete version (authenticated)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const versionDoc = await Version.findById(req.params.id);
    if (!versionDoc) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Extract filename from downloadURL
    const url = new URL(versionDoc.downloadURL);
    const filename = url.pathname.split('/').pop();

    // Delete from MinIO
    if (filename) {
      try {
        await minioClient.removeObject(BUCKET_NAME, filename);
      } catch (minioError) {
        console.warn('Failed to delete file from MinIO:', minioError);
      }
    }

    await Version.findByIdAndDelete(req.params.id);
    res.json({ message: 'Version deleted' });
  } catch (error) {
    console.error('Delete version error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
