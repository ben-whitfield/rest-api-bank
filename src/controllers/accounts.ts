import express from 'express';

import { getAccountById, createAccount, getAccountByUserAndName } from '../db/accounts';

export const create = async (req: express.Request, res: express.Response) => {
  try {
    const { name, type, userId, currency } = req.body || {};

    console.log(`Registering account for user ${userId} with name ${name} and type ${type}`);
    
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
    console.log(`Fetching account with ID: ${id}`);
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