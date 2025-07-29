import express from 'express';
import {
  createAccount,
  getAccounts,
  getAccountByNumber,
  updateAccountByNumber,
  deleteAccountByNumber,
} from '../db/accounts';

export const create = async (req: express.Request, res: express.Response) => {
  try {
    const { name, accountType } = req.body;
    const userId = (req as any).identity?._id;

    if (!name || !accountType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const accountNumber = "01" + Math.floor(100000 + Math.random() * 900000).toString();

    const account = await createAccount({
      accountNumber,
      name,
      accountType,
      userId,
      balance: 0.0,
      currency: "GBP",
      sortCode: "10-10-10",
      createdTimestamp: new Date(),
      updatedTimestamp: new Date(),
    });

    return res.status(201).json(account);
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const list = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).identity?._id;
    const accounts = await getAccounts(userId);
    return res.status(200).json({ accounts });
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const get = async (req: express.Request, res: express.Response) => {
  try {
    const { accountNumber } = req.params;
    const userId = (req as any).identity?._id;
    const account = await getAccountByNumber(accountNumber);

    if (!account) {
      return res.status(404).json({ message: 'Bank account was not found' });
    }
    if (account.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(200).json(account);
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const update = async (req: express.Request, res: express.Response) => {
  try {
    const { accountNumber } = req.params;
    const userId = (req as any).identity?._id;
    const account = await getAccountByNumber(accountNumber);

    if (!account) {
      return res.status(404).json({ message: 'Bank account was not found' });
    }
    if (account.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await updateAccountByNumber(accountNumber, {
      ...req.body,
      updatedTimestamp: new Date(),
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
};

export const remove = async (req: express.Request, res: express.Response) => {
  try {
    const { accountNumber } = req.params;
    const userId = (req as any).identity?._id;
    const account = await getAccountByNumber(accountNumber);

    if (!account) {
      return res.status(404).json({ message: 'Bank account was not found' });
    }
    if (account.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await deleteAccountByNumber(accountNumber);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
};