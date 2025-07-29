import request from 'supertest';
import express from 'express';
import accountsRoutes from './accounts';
import * as accountsController from '../controllers/accounts';
import * as middleware from '../middleware';

jest.mock('../controllers/accounts');
jest.mock('../middleware', () => ({
  isAuthenticated: jest.fn((req: any, res: any, next: any) => next()),
}));

const app = express();
app.use(express.json());
accountsRoutes(app);

describe('Accounts Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /v1/accounts calls isAuthenticated and create', async () => {
    (accountsController.create as jest.Mock).mockImplementation((req, res) => res.status(201).send('created'));
    const res = await request(app)
      .post('/v1/accounts')
      .send({ name: 'Test', accountType: 'personal' });
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(accountsController.create).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  it('GET /v1/accounts calls isAuthenticated and list', async () => {
    (accountsController.list as jest.Mock).mockImplementation((req, res) => res.status(200).send('list'));
    const res = await request(app).get('/v1/accounts');
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(accountsController.list).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('GET /v1/accounts/:accountNumber calls isAuthenticated and get', async () => {
    (accountsController.get as jest.Mock).mockImplementation((req, res) => res.status(200).send('get'));
    const res = await request(app).get('/v1/accounts/01234567');
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(accountsController.get).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('PATCH /v1/accounts/:accountNumber calls isAuthenticated and update', async () => {
    (accountsController.update as jest.Mock).mockImplementation((req, res) => res.status(200).send('updated'));
    const res = await request(app)
      .patch('/v1/accounts/01234567')
      .send({ name: 'Updated Account' });
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(accountsController.update).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('DELETE /v1/accounts/:accountNumber calls isAuthenticated and remove', async () => {
    (accountsController.remove as jest.Mock).mockImplementation((req, res) => res.status(204).send());
    const res = await request(app).delete('/v1/accounts/01234567');
    expect(middleware.isAuthenticated).toHaveBeenCalled();
    expect(accountsController.remove).toHaveBeenCalled();
    expect(res.status).toBe(204);
  });
});