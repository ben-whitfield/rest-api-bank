import express from 'express';
import { createUser, getUserByEmail } from '../db/users';
import { authentication, random } from '../helpers';

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).send('Missing email or password');
    }

    const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

    if (!user) {
      return res.status(400).send('User not found');
    }

    const expectedHash = authentication(user.authentication.salt, password);
    console.log('Expected hash:', expectedHash);
    console.log('User password:', user.authentication.password);

    if(user.authentication.password !== expectedHash) {
      return res.status(403).send('Invalid password');
    }

    const salt = random();
    user.authentication.sessionToken = authentication(salt, user._id.toString());

    await user.save();
    res.cookie('BANK_AUTH', user.authentication.sessionToken, { domain: 'localhost', path: '/', httpOnly: true, secure: false });
    return res.status(200).send('Logging in user:' + email).json(user).end();

  } catch (error) {
    console.log('Error during login:', error);
    return res.status(400).send('Error during login');
  }
}

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, password, email } = req.body || {};
    
    if (!username || !password || !email) {
      return res.status(400).send('Missing required fields');
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const salt = random();
    const user = await createUser({
      username,
      email,
      authentication: {
        salt,
        password: authentication(salt, password),
      }
    });

    return res.status(200).json(user).end();

  } catch (error) {
    console.log('Error during registration:', error);
    return res.status(400).send('Error during registration');
  }
}