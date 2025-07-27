import express from 'express';

import { getUsers, deleteUserById, getUserById } from '../db/users';

export const getAllUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' });
  }
}

export const deleteUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const deletedUser = await deleteUserById(id);
    if ( deletedUser ) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' });
  }
}

export const updateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const existingUser = await getUserById(id);

    existingUser.username = username;
    await existingUser.save();
    return res.status(200).json(existingUser).end();
    
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' });
  }
}