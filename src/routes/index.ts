import express from 'express';

import authentication from './authentication';
import users from './users';
import accounts from './accounts';

const router = express.Router();

export default (): express.Router => {
  // router.get('/', (req, res) => {
  //   res.json({ message: 'Welcome to the REST API Bank!' });
  // });

  
  // router.use((req, res) => {
  //   res.status(404).json({ message: 'Route not found' });
  // });
  authentication(router);
  users(router);
  accounts(router);
  
  return router;
}