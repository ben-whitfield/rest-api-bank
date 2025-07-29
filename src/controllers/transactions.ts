import express from 'express';
import { createTransaction, getTransactionsByAccount, getTransactionById } from '../db/transactions';
import { AccountModel } from '../db/accounts';

export const create = async (req: express.Request, res: express.Response) => {
  try {
    const { accountNumber } = req.params;
    console.log('Creating transaction for account:', accountNumber);
    const userId = (req as any).identity?._id;
    const { amount, currency, type, reference} = req.body || {};

    if (!amount || !currency || !type || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the account by accountNumber
    const account = await AccountModel.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const transaction = await createTransaction({
      amount,
      currency,
      type,
      reference,
      userId,
      accountId: account._id,
      createdTimestamp: new Date(),
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.log('Error creating transaction:', error);
    return res.status(400).json({ message: 'Error creating transaction' });
  }
};

export const list = async (req: express.Request, res: express.Response) => {
  try {
    const { accountNumber } = req.params;

    const account = await AccountModel.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const transactions = await getTransactionsByAccount(account._id.toString());
    return res.status(200).json({ transactions });
  } catch (error) {
    console.log('Error listing transactions:', error);
    return res.status(400).json({ message: 'Error listing transactions' });
  }
};

export const get = async (req: express.Request, res: express.Response) => {
  try {
    const { transactionId, accountNumber } = req.params;
    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const account = await AccountModel.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (transaction.accountId.toString() !== account._id.toString()) {
      return res.status(400).json({ message: 'Transaction does not belong to this account' });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.log('Error fetching transaction:', error);
    return res.status(500).json({ message: 'Error fetching transaction' });
  }
};