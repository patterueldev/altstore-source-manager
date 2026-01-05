import { Request, Response, NextFunction } from 'express';
import AccessKey from '../models/AccessKey.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

/**
 * Middleware to authenticate requests using X-Access-Key header.
 * Expects header format: X-Access-Key: key:secret
 * Updates lastUsedAt timestamp on successful authentication.
 */
export const accessKeyAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['x-access-key'];

    if (!authHeader || typeof authHeader !== 'string') {
      res.status(401).json({ error: 'Missing X-Access-Key header' });
      return;
    }

    const [key, secret] = authHeader.split(':');

    if (!key || !secret) {
      res.status(401).json({
        error: 'Invalid X-Access-Key format. Expected: key:secret',
      });
      return;
    }

    // Find access key by public key identifier
    const accessKey = await AccessKey.findOne({ key, active: true }).populate(
      'userId'
    );

    if (!accessKey) {
      res.status(401).json({ error: 'Invalid access key' });
      return;
    }

    // Compare provided secret with stored hash
    const isValidSecret = await accessKey.compareSecret(secret);

    if (!isValidSecret) {
      res.status(401).json({ error: 'Invalid access secret' });
      return;
    }

    // Update lastUsedAt
    accessKey.lastUsedAt = new Date();
    await accessKey.save();

    // Attach user info to request
    req.user = {
      userId: accessKey.userId.toString(),
      username: (accessKey.userId as any).username,
    };

    next();
  } catch (error) {
    console.error('Access key auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
