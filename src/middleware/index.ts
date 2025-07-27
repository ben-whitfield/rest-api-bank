import express from 'express';
import { get, identity } from 'lodash';
import jwt from 'jsonwebtoken';

import { getUserBySessionToken } from '../db/users';

declare global {
  namespace Express {
    interface Request {
      identity?: any;
    }
  }
}

const SECRET = process.env.SECRET;

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const sessionToken = authHeader.split(' ')[1];
    
    if (!sessionToken) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(sessionToken, SECRET);
    if (!decoded ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    (req as any).user = decoded;
    
    req.identity = existingUser;
    
    return next();
  } catch (error) {
    console.log('Authentication error:', error);
    return res.status(400).json({ message: 'Authentication error' });
  }
}

export const isOwner = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, 'identity._id') as string;
    if (!currentUserId) {
      return res.status(403).send('Unauthorized');
    }

    if (currentUserId.toString() !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  } catch (error) {
    return res.status(400).json({ message: 'Authorization error' });
  }
}