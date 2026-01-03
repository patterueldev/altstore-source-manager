import express, { Router } from 'express';
import { App } from '../models/App.js';
import { Version } from '../models/Version.js';
import { authMiddleware } from '../middleware/auth.js';

const router: Router = express.Router();

// Get all apps
router.get('/', async (req, res) => {
  try {
    const apps = await App.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    console.error('Get apps error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single app
router.get('/:id', async (req, res) => {
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
    const { name, bundleIdentifier, developerName, subtitle, localizedDescription, iconURL, tintColor } = req.body;

    if (!name || !bundleIdentifier || !developerName) {
      return res.status(400).json({ error: 'Name, bundleIdentifier, and developerName are required' });
    }

    const app = new App({
      name,
      bundleIdentifier,
      developerName,
      subtitle,
      localizedDescription,
      iconURL,
      tintColor,
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
    const { name, bundleIdentifier, developerName, subtitle, localizedDescription, iconURL, tintColor } = req.body;
    
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
