import request from 'supertest';
import express from 'express';
import accountsRoutes from './accounts';
import * as accountsController from '../controllers/accounts';
import * as middleware from '../middleware';

jest.mock('../controllers/accounts');
jest.mock('../middleware', () => ({
  isAuthenticated: jest.fn((req, res, next) => next()),
  isOwner: jest.fn((req, res, next) => next()),
  isAccountOwner: jest.fn((req, res, next) => next()),
}));

const app = express();
app.use(express.json());
accountsRoutes(app);

describe('Accounts Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /account/:id calls isAuthenticated, isAccountOwner, and getAccount', async () => {
    (accountsController.getAccount as jest.Mock).mockImplementation((req, res) => res.status(200).send('ok'));
    const res = await request(app).get('/account/123');
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(middleware.isAccountOwner).toHaveBeenCalled();
    expect(accountsController.getAccount).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('GET /accounts/:id calls isAuthenticated, isOwner, and getAccounts', async () => {
    (accountsController.getAccounts as jest.Mock).mockImplementation((req, res) => res.status(200).send('ok'));
    const res = await request(app).get('/accounts/123');
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(middleware.isOwner).toHaveBeenCalled();
    expect(accountsController.getAccounts).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('POST /accounts/create calls isAuthenticated and create', async () => {
    (accountsController.create as jest.Mock).mockImplementation((req, res) => res.status(201).send('created'));
    const res = await request(app).post('/accounts/create').send({ name: 'Test', accountType: 'personal' });
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(accountsController.create).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  it('DELETE /accounts/:id calls isAuthenticated, isAccountOwner, and deleteAccount', async () => {
    (accountsController.deleteAccount as jest.Mock).mockImplementation((req, res) => res.status(204).send());
    const res = await request(app).delete('/accounts/123');
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(middleware.isAccountOwner).toHaveBeenCalled();
    expect(accountsController.deleteAccount).toHaveBeenCalled();
    expect(res.status).toBe(204);
  });

  it('PATCH /v1/accounts/:id calls isAuthenticated, isAccountOwner, and updateAccount', async () => {
    (accountsController.updateAccount as jest.Mock).mockImplementation((req, res) => res.status(200).send('updated'));
    const res = await request(app)
      .patch('/v1/accounts/123')
      .send({ name: 'Updated Account', accountType: 'personal' });
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(middleware.isAccountOwner).toHaveBeenCalled();
    expect(accountsController.updateAccount).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});