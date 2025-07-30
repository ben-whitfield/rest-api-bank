import express from 'express';

import authentication from './authentication';
import users from './users';
import accounts from './accounts';
import transactions from './transactions';

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  users(router);
  accounts(router);
  transactions(router);
  
  return router;
}