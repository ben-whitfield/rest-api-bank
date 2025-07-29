import express from 'express';
import { create, list, get, update, remove } from '../controllers/accounts';
import { isAuthenticated } from '../middleware';

export default (router: express.Router) => {
  router.post('/v1/accounts', isAuthenticated, create);
  router.get('/v1/accounts', isAuthenticated, list);
  router.get('/v1/accounts/:accountNumber', isAuthenticated, get);
  router.patch('/v1/accounts/:accountNumber', isAuthenticated, update);
  router.delete('/v1/accounts/:accountNumber', isAuthenticated, remove);
};