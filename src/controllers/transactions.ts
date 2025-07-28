import express from 'express';
import { createTransaction, getTransactionsByAccount, getTransactionById } from '../db/transactions';

export const create = async (req: express.Request, res: express.Response) => {
  try {
    const { accountNumber } = req.params;
    const { amount, currency, type, reference, userId } = req.body || {};

    if (!amount || !currency || !type || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const transaction = await createTransaction({
      amount,
      currency,
      type,
      reference,
      userId,
      accountNumber,
      createdTimestamp: new Date(),
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.log('Error creating transaction:', error);
    return res.status(500).json({ message: 'Error creating transaction' });
  }
};

export const list = async (req: express.Request, res: express.Response) => {
  try {
    const { accountNumber } = req.params;
    const transactions = await getTransactionsByAccount(accountNumber);
    return res.status(200).json({ transactions });
  } catch (error) {
    console.log('Error listing transactions:', error);
    return res.status(500).json({ message: 'Error listing transactions' });
  }
};

export const get = async (req: express.Request, res: express.Response) => {
  try {
    const { transactionId, accountNumber } = req.params;
    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.accountNumber !== accountNumber) {
      return res.status(400).json({ message: 'Transaction does not belong to this account' });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.log('Error fetching transaction:', error);
    return res.status(500).json({ message: 'Error fetching transaction' });
  }
};