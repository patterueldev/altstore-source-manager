import express, { Router } from 'express';
import { SourceConfig } from '../models/SourceConfig.js';
import { authMiddleware } from '../middleware/auth.js';

const router: Router = express.Router();

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

export default router;
