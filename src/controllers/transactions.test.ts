import express from 'express';
import * as transactionsController from './transactions';
import * as db from '../db/transactions';
import { AccountModel } from '../db/accounts';

jest.mock('../db/transactions');
jest.mock('../db/accounts');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as express.Response;
};

describe('Transactions Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { params: { accountNumber: 'acc123' }, body: {}, identity: { _id: 'user1' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should return 404 if account is not found', async () => {
      (AccountModel.findOne as jest.Mock).mockResolvedValue(null);
      const req = { params: { accountNumber: 'acc123' }, body: { amount: 10, currency: 'GBP', type: 'deposit' }, identity: { _id: 'user1' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });

    it('should create a transaction and return 201', async () => {
      const mockAccount = { _id: 'accountId1' };
      (AccountModel.findOne as jest.Mock).mockResolvedValue(mockAccount);
      const mockTransaction = { _id: 'tx1', amount: 10 };
      (db.createTransaction as jest.Mock).mockResolvedValue(mockTransaction);

      const req = {
        params: { accountNumber: 'acc123' },
        body: { amount: 10, currency: 'GBP', type: 'deposit' },
        identity: { _id: 'user1' }
      } as unknown as express.Request;
      const res = mockRes();

      await transactionsController.create(req, res);
      expect(db.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
        amount: 10,
        currency: 'GBP',
        type: 'deposit',
        userId: 'user1',
        accountId: mockAccount._id,
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle errors and return 400', async () => {
      (AccountModel.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = { params: { accountNumber: 'acc123' }, body: { amount: 10, currency: 'GBP', type: 'deposit' }, identity: { _id: 'user1' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating transaction' });
    });
  });

  describe('list', () => {
    it('should return 404 if account is not found', async () => {
      (AccountModel.findOne as jest.Mock).mockResolvedValue(null);
      const req = { params: { accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.list(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });

    it('should return transactions for an account', async () => {
      const mockAccount = { _id: 'accountId1' };
      (AccountModel.findOne as jest.Mock).mockResolvedValue(mockAccount);
      const mockTransactions = [{ _id: 'tx1' }, { _id: 'tx2' }];
      (db.getTransactionsByAccount as jest.Mock).mockResolvedValue(mockTransactions);

      const req = { params: { accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();

      await transactionsController.list(req, res);
      expect(db.getTransactionsByAccount).toHaveBeenCalledWith('accountId1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transactions: mockTransactions });
    });

    it('should handle errors and return 400', async () => {
      (AccountModel.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = { params: { accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.list(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error listing transactions' });
    });
  });

  describe('get', () => {
    it('should return 404 if transaction not found', async () => {
      (db.getTransactionById as jest.Mock).mockResolvedValue(null);
      const req = { params: { transactionId: 'tx1', accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.get(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction not found' });
    });

    it('should return 404 if account not found', async () => {
      (db.getTransactionById as jest.Mock).mockResolvedValue({ accountId: 'accountId1' });
      (AccountModel.findOne as jest.Mock).mockResolvedValue(null);
      const req = { params: { transactionId: 'tx1', accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.get(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });

    it('should return 400 if transaction does not belong to this account', async () => {
      (db.getTransactionById as jest.Mock).mockResolvedValue({ accountId: 'accountId1' });
      (AccountModel.findOne as jest.Mock).mockResolvedValue({ _id: 'accountId2' });
      const req = { params: { transactionId: 'tx1', accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.get(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction does not belong to this account' });
    });

    it('should return transaction if found and belongs to account', async () => {
      (db.getTransactionById as jest.Mock).mockResolvedValue({ accountId: 'accountId1' });
      (AccountModel.findOne as jest.Mock).mockResolvedValue({ _id: 'accountId1' });
      const req = { params: { transactionId: 'tx1', accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.get(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ accountId: 'accountId1' });
    });

    it('should handle errors and return 500', async () => {
      (db.getTransactionById as jest.Mock).mockRejectedValue(new Error('DB error'));
      const req = { params: { transactionId: 'tx1', accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.get(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching transaction' });
    });
  });
});