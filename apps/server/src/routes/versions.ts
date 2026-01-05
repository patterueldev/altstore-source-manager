import express, { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import plist from 'plist';
import { Version } from '../models/Version.js';
import { App } from '../models/App.js';
import { authMiddleware } from '../middleware/auth.js';
import { accessKeyAuth } from '../middleware/accessKeyAuth.js';
import { Client as MinioClient } from 'minio';
import { buildStoragePath } from '../utils/publicUrl.js';
import { parseBuffer as parseBinaryPlist } from 'bplist-parser';

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

type IpaMetadata = {
  version?: string;
  buildVersion?: string;
  minOSVersion?: string;
  bundleIdentifier?: string;
  name?: string;
};

function extractIpaMetadata(buffer: Buffer): IpaMetadata {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const infoEntry = entries.find((entry) => /Payload\/[^/]+\.app\/Info\.plist$/i.test(entry.entryName));

  if (!infoEntry) {
    throw new Error('Info.plist not found in IPA');
  }

  const data = infoEntry.getData();
  let parsed: any;

  // Detect binary plist by signature
  if (data.slice(0, 6).toString('utf8') === 'bplist') {
    const parsedArr = parseBinaryPlist(data);
    parsed = parsedArr?.[0];
  } else {
    parsed = plist.parse(data.toString());
  }

  if (!parsed) {
    throw new Error('Failed to parse Info.plist');
  }

  return {
    version: parsed.CFBundleShortVersionString,
    buildVersion: parsed.CFBundleVersion,
    minOSVersion: parsed.MinimumOSVersion,
    bundleIdentifier: parsed.CFBundleIdentifier,
    name: parsed.CFBundleDisplayName || parsed.CFBundleName,
  };
}

// Get all versions for an app (protected)
router.get('/app/:appId', authMiddleware, async (req, res) => {
  try {
    const versions = await Version.find({ appId: req.params.appId }).sort({ date: -1 });
    res.json(versions);
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single version (protected)
router.get('/:id', authMiddleware, async (req, res) => {
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

// Extract metadata from IPA without persisting (authenticated)
router.post('/ipa-metadata', authMiddleware, upload.single('ipa'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'IPA file is required' });
    }

    const metadata = extractIpaMetadata(req.file.buffer);

    res.json({ metadata });
  } catch (error: any) {
    console.error('IPA metadata error:', error);
    res.status(400).json({ error: error?.message || 'Failed to read IPA metadata' });
  }
});

// Create version with IPA upload (authenticated)
router.post('/', authMiddleware, upload.single('ipa'), async (req, res) => {
  try {
    const { appId, version, buildVersion, date, localizedDescription, minOSVersion, maxOSVersion, visible } = req.body;

    if (!appId || !version || !buildVersion || !date || !minOSVersion || !localizedDescription) {
      return res.status(400).json({ error: 'appId, version, buildVersion, date, minOSVersion, and localizedDescription are required' });
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

    // Store relative path (will be converted to full URL on read)
    const downloadPath = buildStoragePath(BUCKET_NAME, filename);

    // Create version record
    const versionDoc = new Version({
      appId,
      version,
      buildVersion,
      date: new Date(date),
      localizedDescription,
      downloadURL: downloadPath,
      size: fileSize,
      minOSVersion,
      maxOSVersion,
      sha256,
      visible: visible !== undefined ? visible : true,
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

// CI upload endpoint using access key authentication
router.post('/ci-upload', accessKeyAuth, upload.single('ipa'), async (req, res) => {
  try {
    const { appId, version, buildVersion, date, localizedDescription, minOSVersion, maxOSVersion, visible } = req.body;

    if (!appId || !version || !buildVersion || !date || !minOSVersion || !localizedDescription) {
      return res.status(400).json({ error: 'appId, version, buildVersion, date, minOSVersion, and localizedDescription are required' });
    }

    const app = await App.findById(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'IPA file is required' });
    }

    const file = req.file;
    const fileBuffer = file.buffer;
    const fileSize = file.size;

    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    const sha256 = hash.digest('hex');

    const filename = `${app.bundleIdentifier}-${version}-${Date.now()}.ipa`;

    await minioClient.putObject(BUCKET_NAME, filename, fileBuffer, fileSize, {
      'Content-Type': 'application/octet-stream',
    });

    const downloadPath = buildStoragePath(BUCKET_NAME, filename);

    const versionDoc = new Version({
      appId,
      version,
      buildVersion,
      date: new Date(date),
      localizedDescription,
      downloadURL: downloadPath,
      size: fileSize,
      minOSVersion,
      maxOSVersion,
      sha256,
      visible: visible !== undefined ? visible : true,
    });

    await versionDoc.save();
    res.status(201).json(versionDoc);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Version already exists for this app' });
    }
    console.error('CI upload version error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Replace IPA for an existing version (authenticated)
router.put('/:id/ipa', authMiddleware, upload.single('ipa'), async (req, res) => {
  try {
    const versionDoc = await Version.findById(req.params.id);
    if (!versionDoc) {
      return res.status(404).json({ error: 'Version not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'IPA file is required' });
    }

    const app = await App.findById(versionDoc.appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found for version' });
    }

    const file = req.file;
    const fileBuffer = file.buffer;
    const fileSize = file.size;

    // Calculate SHA256
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    const sha256 = hash.digest('hex');

    // Generate unique filename
    const filename = `${app.bundleIdentifier}-${versionDoc.version}-${Date.now()}.ipa`;

    // Upload to MinIO
    await minioClient.putObject(BUCKET_NAME, filename, fileBuffer, fileSize, {
      'Content-Type': 'application/octet-stream',
    });

    // Best-effort removal of the previous object
    const previousKey = extractObjectKey(versionDoc.downloadURL);
    if (previousKey) {
      minioClient.removeObject(BUCKET_NAME, previousKey).catch((err) => {
        console.warn('Failed to delete previous IPA from MinIO:', err);
      });
    }

    // Store relative path (will be converted to full URL on read)
    const downloadPath = buildStoragePath(BUCKET_NAME, filename);

    versionDoc.downloadURL = downloadPath;
    versionDoc.size = fileSize;
    versionDoc.sha256 = sha256;
    await versionDoc.save();

    res.json(versionDoc);
  } catch (error) {
    console.error('Replace IPA error:', error);
    res.status(500).json({ error: 'Failed to replace IPA' });
  }
});

// Update version (authenticated)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { version, buildVersion, date, localizedDescription, minOSVersion, maxOSVersion, visible } = req.body;
    
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
    if (visible !== undefined) versionDoc.visible = visible;

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

    // Extract object key from downloadURL path
    const filename = extractObjectKey(versionDoc.downloadURL);

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

// Upload version screenshots (authenticated)
router.post('/:id/screenshots', authMiddleware, upload.array('screenshots', 10), async (req, res) => {
  try {
    const versionDoc = await Version.findById(req.params.id);
    if (!versionDoc) {
      return res.status(404).json({ error: 'Version not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Screenshot files are required' });
    }

    const files = req.files as Express.Multer.File[];
    const screenshotURLs: string[] = [];
    const SCREENSHOTS_BUCKET = 'screenshots';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = `version-${req.params.id}-${Date.now()}-${i}.png`;

      // Upload to MinIO
      await minioClient.putObject(SCREENSHOTS_BUCKET, filename, file.buffer, file.size, {
        'Content-Type': 'image/png',
      });

      const screenshotPath = buildStoragePath(SCREENSHOTS_BUCKET, filename);
      screenshotURLs.push(screenshotPath);
    }

    // Append to existing screenshots or replace
    if (!versionDoc.screenshots) {
      versionDoc.screenshots = [];
    }
    versionDoc.screenshots.push(...screenshotURLs);
    await versionDoc.save();

    res.json({ screenshots: versionDoc.screenshots });
  } catch (error) {
    console.error('Upload screenshots error:', error);
    res.status(500).json({ error: 'Failed to upload screenshots' });
  }
});

export default router;
