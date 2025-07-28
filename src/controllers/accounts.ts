import express from 'express';

import { getAccountByUserId, createAccount, getAccountByUserAndName, getAccountById, deleteAccountById } from '../db/accounts';

export const create = async (req: express.Request, res: express.Response) => {
  try {
    const { name, type, userId, currency } = req.body || {};

    if (!name || !type || !userId || !currency) {
      return res.status(400).send('Missing required fields');
    }

    const existingAccount = await getAccountByUserAndName(name, userId);
    if (existingAccount) {
      return res.status(409).send('Account already exists');
    }

    const account = await createAccount({
      name,
      accountType: type,
      userId,
      currency,
      balance: 0,
    });

    return res.status(200).json(account).end();

  } catch (error) {
    console.log('Error during registration:', error);
    return res.status(400).send('Error during registration');
  }
}

export const getAccount = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const existingAccount = await getAccountById(id);
    if ( existingAccount ) {
      res.status(200).json(existingAccount);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' });
  }
}

export const getAccounts = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const existingAccounts = await getAccountByUserId(id);
    if ( existingAccounts ) {
      res.status(200).json(existingAccounts);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' });
  }
}

export const deleteAccount = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const deletedAccount = await deleteAccountById(id);
    if ( deletedAccount ) {
      res.status(200).json({ message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Internal Server Error' });
  }
}