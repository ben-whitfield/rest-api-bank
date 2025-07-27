import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '.env', quiet: true });


const SECRET = process.env.SECRET;

export const random = () => crypto.randomBytes(128).toString('base64');
export const authentication = (salt: string, password: string) => {
  return crypto
    .createHmac('sha256', [salt, password].join('/')).update(SECRET).digest('hex');
};

// Generate a JWT token
export const generateJWT = (payload: object) => {
  return jwt.sign(payload, SECRET, { expiresIn: '6h' });
};

// Verify a JWT token
export const verifyJWT = (token: string) => {
  return jwt.verify(token, SECRET);
};