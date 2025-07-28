import express from 'express';
import { isAuthenticated, isOwner, isAccountOwner, isTransactionOwner } from './index';
import jwt from 'jsonwebtoken';
import { AccountsModel } from '../db/accounts';
import { TransactionModel } from '../db/transactions';
import { getUserBySessionToken } from '../db/users';

jest.mock('jsonwebtoken');
jest.mock('../db/accounts');
jest.mock('../db/transactions');
jest.mock('../db/users');

const mockReq = (options: any = {}) => {
  const req: any = {
    headers: {},
    params: {},
    ...options,
  };
  return req as express.Request;
};

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as express.Response;
};

const mockNext = jest.fn();

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should return 401 if no token provided', async () => {
      const req = mockReq();
      const res = mockRes();
      await isAuthenticated(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    });

    it('should return 403 if token is missing after Bearer', async () => {
      const req = mockReq({ headers: { authorization: 'Bearer ' } });
      const res = mockRes();
      await isAuthenticated(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 403 if jwt.verify fails', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });
      const req = mockReq({ headers: { authorization: 'Bearer token' } });
      const res = mockRes();
      await isAuthenticated(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication error' });
    });

    it('should call next if token and user are valid', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });
      (getUserBySessionToken as jest.Mock).mockResolvedValue({ _id: 'user123' });
      const req = mockReq({ headers: { authorization: 'Bearer token' } });
      const res = mockRes();
      await isAuthenticated(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(req.identity).toEqual({ _id: 'user123' });
    });
  });

  describe('isOwner', () => {
    it('should return 403 if user not authenticated', () => {
      const req = mockReq({ params: { id: 'user123' } });
      const res = mockRes();
      isOwner(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith('Unauthorized');
    });

    it('should return 403 if user id does not match', () => {
      const req = mockReq({ params: { id: 'user123' }, identity: { _id: 'user456' } });
      const res = mockRes();
      isOwner(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('should call next if user id matches', () => {
      const req = mockReq({ params: { id: 'user123' }, identity: { _id: 'user123' } });
      const res = mockRes();
      isOwner(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('isAccountOwner', () => {
    it('should return 403 if user not authenticated', async () => {
      const req = mockReq({ params: { id: 'acc123' } });
      const res = mockRes();
      await isAccountOwner(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith('Unauthorized');
    });

    it('should return 404 if account not found', async () => {
      (AccountsModel.findById as jest.Mock).mockResolvedValue(null);
      const req = mockReq({ params: { id: 'acc123' }, identity: { _id: 'user123' } });
      const res = mockRes();
      await isAccountOwner(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });

    it('should return 403 if user is not account owner', async () => {
      (AccountsModel.findById as jest.Mock).mockResolvedValue({ userId: 'user456' });
      const req = mockReq({ params: { id: 'acc123' }, identity: { _id: 'user123' } });
      const res = mockRes();
      await isAccountOwner(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('should call next if user is account owner', async () => {
      (AccountsModel.findById as jest.Mock).mockResolvedValue({ userId: 'user123' });
      const req = mockReq({ params: { id: 'acc123' }, identity: { _id: 'user123' } });
      const res = mockRes();
      await isAccountOwner(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('isTransactionOwner', () => {
    it('should return 403 if user not authenticated', async () => {
      const req = mockReq({ params: { id: 'tx123' } });
      const res = mockRes();
      await isTransactionOwner(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith('Unauthorized');
    });

    it('should return 404 if transaction not found', async () => {
      (TransactionModel.findById as jest.Mock).mockResolvedValue(null);
      const req = mockReq({ params: { id: 'tx123' }, identity: { _id: 'user123' } });
      const res = mockRes();
      await isTransactionOwner(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction not found' });
    });

    it('should return 404 if account not found', async () => {
      (TransactionModel.findById as jest.Mock).mockResolvedValue({ accountNumber: 'acc123' });
      (AccountsModel.findOne as jest.Mock).mockResolvedValue(null);
      const req = mockReq({ params: { id: 'tx123' }, identity: { _id: 'user123' } });
      const res = mockRes();
      await isTransactionOwner(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
    });

    it('should return 403 if user is not transaction owner', async () => {
      (TransactionModel.findById as jest.Mock).mockResolvedValue({ accountNumber: 'acc123' });
      (AccountsModel.findOne as jest.Mock).mockResolvedValue({ userId: 'user456' });
      const req = mockReq({ params: { id: 'tx123' }, identity: { _id: 'user123' } });
      const res = mockRes();
      await isTransactionOwner(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('should call next if user is transaction owner', async () => {
      (TransactionModel.findById as jest.Mock).mockResolvedValue({ accountNumber: 'acc123' });
      (AccountsModel.findOne as jest.Mock).mockResolvedValue({ userId: 'user123' });
      const req = mockReq({ params: { id: 'tx123' }, identity: { _id: 'user123' } });
      const res = mockRes();
      await isTransactionOwner(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});