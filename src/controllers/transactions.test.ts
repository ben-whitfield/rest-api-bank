import express from 'express';
import * as transactionsController from './transactions';
import * as db from '../db/transactions';

jest.mock('../db/transactions');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as express.Response;
};

describe('Transactions Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = { params: { accountNumber: 'acc123' }, body: {} } as unknown as express.Request;
      const res = mockRes();
      await transactionsController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should create a transaction and return 201', async () => {
      const req = {
        params: { accountNumber: 'acc123' },
        body: { amount: 100, currency: 'GBP', type: 'deposit', reference: 'ref', userId: 'user123' }
      } as unknown as express.Request;
      const res = mockRes();
      const mockTransaction = { _id: 'tx123', ...req.body, accountNumber: 'acc123', createdTimestamp: new Date() };
      (db.createTransaction as jest.Mock).mockResolvedValue(mockTransaction);

      await transactionsController.create(req, res);
      expect(db.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
        amount: 100,
        currency: 'GBP',
        type: 'deposit',
        reference: 'ref',
        userId: 'user123',
        accountNumber: 'acc123',
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle errors and return 400', async () => {
      const req = {
        params: { accountNumber: 'acc123' },
        body: { amount: 100, currency: 'GBP', type: 'deposit', reference: 'ref', userId: 'user123' }
      } as unknown as express.Request;
      const res = mockRes();
      (db.createTransaction as jest.Mock).mockRejectedValue(new Error('DB error'));
      await transactionsController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating transaction' });
    });
  });

  describe('list', () => {
    it('should return transactions for an account', async () => {
      const req = { params: { accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      const mockTransactions = [{ _id: 'tx1' }, { _id: 'tx2' }];
      (db.getTransactionsByAccount as jest.Mock).mockResolvedValue(mockTransactions);

      await transactionsController.list(req, res);
      expect(db.getTransactionsByAccount).toHaveBeenCalledWith('acc123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transactions: mockTransactions });
    });

    it('should handle errors and return 400', async () => {
      const req = { params: { accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      (db.getTransactionsByAccount as jest.Mock).mockRejectedValue(new Error('DB error'));
      await transactionsController.list(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error listing transactions' });
    });
  });

  describe('get', () => {
    it('should return 404 if transaction not found', async () => {
      const req = { params: { transactionId: 'tx123', accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      (db.getTransactionById as jest.Mock).mockResolvedValue(null);

      await transactionsController.get(req, res);
      expect(db.getTransactionById).toHaveBeenCalledWith('transactionId' in req.params ? req.params.transactionId : undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction not found' });
    });

    it('should return 400 if transaction does not belong to account', async () => {
      const req = { params: { transactionId: 'tx123', accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      (db.getTransactionById as jest.Mock).mockResolvedValue({ accountNumber: 'otherAcc' });

      await transactionsController.get(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction does not belong to this account' });
    });

    it('should return transaction if found and belongs to account', async () => {
      const req = { params: { transactionId: 'tx123', accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      const mockTransaction = { _id: 'tx123', accountNumber: 'acc123' };
      (db.getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);

      await transactionsController.get(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it('should handle errors and return 500', async () => {
      const req = { params: { transactionId: 'tx123', accountNumber: 'acc123' } } as unknown as express.Request;
      const res = mockRes();
      (db.getTransactionById as jest.Mock).mockRejectedValue(new Error('DB error'));

      await transactionsController.get(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching transaction' });
      });
  });
});