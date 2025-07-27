import express from 'express';
import { get, identity, merge } from 'lodash';

import { getUserBySessionToken } from '../db/users';

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const sessionToken = req.cookies.BANK_AUTH;
    if (!sessionToken) {
      return res.status(403).send('Unauthorized');
    }

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) {
      return res.status(403).send('Unauthorized');
    }

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