import express from 'express';
import { getAccount, getAccounts, create, deleteAccount, updateAccount } from '../controllers/accounts';
import { isAuthenticated, isOwner, isAccountOwner } from '../middleware';

export default (router: express.Router) => {
  router.get('/account/:id', isAuthenticated, isAccountOwner, getAccount);
  router.get('/accounts/:id', isAuthenticated, isOwner, getAccounts);
  router.post('/accounts/create', isAuthenticated, create);
  router.delete('/accounts/:id', isAuthenticated, isAccountOwner, deleteAccount);
  router.patch('/v1/accounts/:id', isAuthenticated, isAccountOwner, updateAccount);
};