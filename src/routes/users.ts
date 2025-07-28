import express from 'express';
import { deleteUser, getAllUsers, updateUser, getUser } from '../controllers/users';
import { isAuthenticated, isOwner } from '../middleware';

export default (router: express.Router) => {
  router.get('/v1/users', isAuthenticated, getAllUsers);
  router.get('/v1/users/:id', isAuthenticated, isOwner, getUser);
  router.delete('/v1/users/:id', isAuthenticated, isOwner, deleteUser);
  router.patch('/v1/users/:id', isAuthenticated, isOwner, updateUser);
};