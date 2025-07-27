import express from 'express';
import { get, identity, merge } from 'lodash';
import jwt from 'jsonwebtoken';

import { getUserBySessionToken } from '../db/users';

const SECRET = process.env.SECRET;

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const sessionToken = authHeader.split(' ')[1];
    console.log('Token received:', sessionToken);

    if (!sessionToken) {
      return res.status(403).send('Unauthorized');
    }

    const decoded = jwt.verify(sessionToken, SECRET);
    if (!decoded ) {
      return res.status(403).send('Unauthorized');
    }

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) {
      return res.status(403).send('Unauthorized');
    }

    (req as any).user = decoded;
    
    merge(req, { identity: existingUser });
    
    return next();
  } catch (error) {
    console.log('Authentication error:', error);
    return res.status(400).send('Authentication error');
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
      return res.status(403).send('Forbidden');
    }

    next();
  } catch (error) {
    return res.status(400).send('Authorization error');
  }
}