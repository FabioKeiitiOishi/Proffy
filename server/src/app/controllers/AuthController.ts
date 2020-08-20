import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import authConfig from '../config/auth.json';
import db from '../../database/connections';
import { hashPassword, verifyPassword } from '../../utils/treatPassword';
import mailer from '../../modules/mailer';
import auth from '../middlewares/auth';

interface AuthUserItem {
  id: number,
  email: string,
  password: string,
  password_reset_token: string,
  password_reset_expires: Date
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
        return response.status(400).json({ error: 'User already exists.' });
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
      
      return response.status(400).json({ error: 'Registration failed.' });
    }
  };

  async authenticate(request: Request, response: Response) {
    const { email, password } = request.body;

    const auth_users = await db('auth_users')
        .where('auth_users.email', '=', email);
    const auth_user = auth_users[0] as AuthUserItem;
    
    if (!auth_user) {
      return response.status(400).json({ error: 'User not found.' });
    }
    if (!await verifyPassword(password, auth_user.password)) {
      return response.status(400).json({ error: 'Invalid password.' });
    }
    auth_user.password = "";

    return response.status(201).send({ 
      auth_user, 
      token: generateToken(auth_user.id)
    });
  };

  async forgot_password(request: Request, response: Response) {
    const { email } = request.body;
    try {
      const auth_users = await db('auth_users')
        .where('auth_users.email', '=', email);
      const auth_user = auth_users[0] as AuthUserItem;
      
      if (!auth_user) {
        return response.status(400).json({
          error: 'User not found.'
        });
      }

      const token = crypto.randomBytes(20).toString('hex');

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await db('auth_users')
        .where('auth_users.id', '=', auth_user.id)
        .update({
          password_reset_token: token,
          password_reset_expires: now
      });

      mailer.sendMail({
        to: email,
        from: 'f.k.oishi@gmail.com',
        subject: 'Recuperação de senha',
        template: 'auth/forgot_password',
        context: { token }
      }, (error) => {
        if (error) {
          return response.status(400).send({ error: 'Cannot send forgot password email.'});
        }
      });

      response.status(200).send();
    } catch (error) {
      response.status(400).send({ error: 'Error on forgot password, please try again.'})
    }
  };

  async reset_password(request: Request, response: Response) {
    const { email, token, password } = request.body;

    try {
      const auth_users = await db('auth_users')
        .where('auth_users.email', '=', email);

      const auth_user = auth_users[0] as AuthUserItem;
      
      if (!auth_user) {
        return response.status(400).json({ error: 'User not found.' });
      }

      if (token !== auth_user.password_reset_token) {
        return response.status(400).send({ error: 'Invalid token.' });
      }

      const now = new Date();
      if (now > auth_user.password_reset_expires) {
        return response.status(400).send({ error: 'Expired token, get another one.'})
      }

      const encryptedPassword = await hashPassword(password);
      await db('auth_users')
        .where('auth_users.id', '=', auth_user.id)
        .update({ password: encryptedPassword });  

      response.status(201).send();
    } catch (error) {
      response.status(400).send({ error: 'Cannot reset password, try again later.'})
    }
  };
}