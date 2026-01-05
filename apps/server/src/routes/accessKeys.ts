import express, { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import AccessKey from '../models/AccessKey';
import { User } from '../models/User';

const router: Router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

/**
 * Check if user is admin
 */
const isAdmin = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId);
  return user?.username === 'admin';
};

/**
 * GET /api/access-keys
 * List all active access keys for the authenticated admin user
 */
router.get(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const admin = await isAdmin(req.user.id);
      if (!admin) {
        res.status(403).json({ error: 'Only admins can manage access keys' });
        return;
      }

      const keys = await AccessKey.find({ userId: req.user.id })
        .select('-secret')
        .sort({ createdAt: -1 });

      res.json(keys);
    } catch (error) {
      console.error('Get access keys error:', error);
      res.status(500).json({ error: 'Failed to fetch access keys' });
    }
  }
);

/**
 * POST /api/access-keys
 * Create a new access key
 * Body: { name: string }
 * Returns: { key, secret, name, createdAt } - SECRET ONLY SHOWN ONCE
 */
router.post(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const admin = await isAdmin(req.user.id);
      if (!admin) {
        res.status(403).json({ error: 'Only admins can create access keys' });
        return;
      }

      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      // Generate new key pair
      const { key, secret } = (AccessKey as any).generateKeyPair();

      // Create and save access key
      const accessKey = new AccessKey({
        userId: req.user.id,
        key,
        secret, // Will be hashed by pre-save hook
        name: name.trim(),
        active: true,
      });

      await accessKey.save();

      // Return key with unhashed secret (only shown once)
      res.status(201).json({
        id: accessKey._id,
        key: accessKey.key,
        secret, // Return the plaintext secret here
        name: accessKey.name,
        createdAt: accessKey.createdAt,
      });
    } catch (error) {
      console.error('Create access key error:', error);
      res.status(500).json({ error: 'Failed to create access key' });
    }
  }
);

/**
 * DELETE /api/access-keys/:id
 * Revoke an access key by marking it inactive
 */
router.delete(
  '/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const admin = await isAdmin(req.user.id);
      if (!admin) {
        res.status(403).json({ error: 'Only admins can revoke access keys' });
        return;
      }

      const accessKey = await AccessKey.findById(req.params.id);

      if (!accessKey) {
        res.status(404).json({ error: 'Access key not found' });
        return;
      }

      // Verify ownership
      if (accessKey.userId.toString() !== req.user.id) {
        res.status(403).json({ error: 'Cannot revoke other users access keys' });
        return;
      }

      // Mark as inactive instead of deleting
      accessKey.active = false;
      await accessKey.save();

      res.json({ message: 'Access key revoked successfully' });
    } catch (error) {
      console.error('Revoke access key error:', error);
      res.status(500).json({ error: 'Failed to revoke access key' });
    }
  }
);

export default router;
