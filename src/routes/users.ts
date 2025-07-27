import express from 'express';
import { deleteUser, getAllUsers, updateUser, getUser } from '../controllers/users';
import { isAuthenticated, isOwner } from '../middleware';

export default (router: express.Router) => {
  router.get('/users', isAuthenticated, getAllUsers);
  router.get('/user/:id', isAuthenticated, isOwner, getUser);
  router.delete('/users/:id', isAuthenticated, isOwner, deleteUser);
  router.patch('/users/:id', isAuthenticated, isOwner, updateUser);
};