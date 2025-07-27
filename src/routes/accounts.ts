import express from 'express';
import { getAccount, create } from '../controllers/accounts';
import { isAuthenticated, isOwner } from '../middleware';

export default (router: express.Router) => {
  router.get('/accounts/:id', isAuthenticated, isOwner, getAccount);
  router.post('/accounts/create', isAuthenticated, create);
};