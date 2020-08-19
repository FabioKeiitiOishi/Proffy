import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import authConfig from '../config/auth.json';
import db from '../database/connections';
import { hashPassword, verifyPassword } from '../utils/treatPassword';

interface AuthUserItem {
  id: number,
  email: string,
  password: string
}

const generateToken = (user_id: number) => {
  return jwt.sign({id: user_id}, authConfig.secret, {
    expiresIn: 7200
  });
}

export default class AuthController {
  async register(request: Request, response: Response) {
    const { email, password } = request.body;

    const auth_user = await db('auth_users')
        .where('auth_users.email', '=', email);

      if (auth_user.length > 0) {
        return response.status(400).json({
          error: 'User already exists.'
        });
      }

    const trans = await db.transaction();
    try {
      const encryptedPassword = await hashPassword(password);
      
      const auth_user = await trans('auth_users').insert({
        email,
        password: encryptedPassword
      });

      const authUserId = auth_user[0];

      await trans.commit();

      return response.status(201).send({
        authUserId,
        token: generateToken(authUserId)
      });
      
    } catch (error) {
      await trans.rollback();
      
      return response.status(400).json({
        error: 'Registration failed.'
      });
    }
  };
  async authenticate(request: Request, response: Response) {
    const { email, password } = request.body;

    const auth_users = await db('auth_users')
        .where('auth_users.email', '=', email);
    const auth_user = auth_users[0] as AuthUserItem;
    
    if (!auth_user){
      return response.status(400).json({
        error: 'User not found.'
      });
    }
    if (!await verifyPassword(password, auth_user.password)) {
      return response.status(400).json({
        error: 'Invalid password.'
      })
    }
    auth_user.password = "";

    return response.status(201).send({ 
      auth_user, 
      token: generateToken(auth_user.id)
    });
  };
}