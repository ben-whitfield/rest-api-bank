import express from 'express';
import { create, list, get } from '../controllers/transactions';
import { isAuthenticated } from '../middleware';

export default (router: express.Router) => {
  router.post('/v1/accounts/:accountNumber/transactions', isAuthenticated, create);
  router.get('/v1/accounts/:accountNumber/transactions', isAuthenticated, list);
  router.get('/v1/accounts/:accountNumber/transactions/:transactionId', isAuthenticated, get);
};