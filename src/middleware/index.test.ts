import express from 'express';
import jwt from 'jsonwebtoken';
import { getUserBySessionToken } from '../db/users';
import { AccountModel } from '../db/accounts';
import { TransactionModel } from '../db/transactions';
import { isAuthenticated, isOwner } from './index';

jest.mock('jsonwebtoken');
jest.mock('../db/users');
jest.mock('../db/accounts');
jest.mock('../db/transactions');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as express.Response;
};

describe('Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should return 401 if no token provided', async () => {
      const req = { headers: {} } as express.Request;
      const res = mockRes();
      const next = jest.fn();
      await isAuthenticated(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    });

    it('should return 403 if token is missing after Bearer', async () => {
      const req = { headers: { authorization: 'Bearer ' } } as express.Request;
      const res = mockRes();
      const next = jest.fn();
      await isAuthenticated(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 403 if jwt.verify fails', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });
      const req = { headers: { authorization: 'Bearer token' } } as express.Request;
      const res = mockRes();
      const next = jest.fn();
      await isAuthenticated(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication error' });
    });

    it('should return 403 if user not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });
      (getUserBySessionToken as jest.Mock).mockResolvedValue(null);
      const req = { headers: { authorization: 'Bearer token' } } as express.Request;
      const res = mockRes();
      const next = jest.fn();
      await isAuthenticated(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should call next if token and user are valid', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });
      (getUserBySessionToken as jest.Mock).mockResolvedValue({ _id: 'user123' });
      const req = { headers: { authorization: 'Bearer token' } } as express.Request;
      const res = mockRes();
      const next = jest.fn();
      await isAuthenticated(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.identity).toEqual({ _id: 'user123' });
    });
  });

  describe('isOwner', () => {
    it('should return 403 if user not authenticated', () => {
      const req = { params: { id: 'user123' } } as null as express.Request;
      const res = mockRes();
      const next = jest.fn();
      isOwner(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith('Unauthorized');
    });

    it('should return 403 if user id does not match', () => {
      const req = { params: { id: 'user123' }, identity: { _id: 'user456' } } as any;
      const res = mockRes();
      const next = jest.fn();
      isOwner(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('should call next if user id matches', () => {
      const req = { params: { id: 'user123' }, identity: { _id: 'user123' } } as any;
      const res = mockRes();
      const next = jest.fn();
      isOwner(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});