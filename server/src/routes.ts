import express from 'express';

import ClassesController from './app/controllers/ClassesController';
import ConnectionsController from './app/controllers/ConnectionsController';
import AuthController from './app/controllers/AuthController';

import authMiddleware from './app/middlewares/auth';

const routes = express.Router();
const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const authController = new AuthController();

routes.post('/auth/register', authController.register);
routes.post('/auth/authenticate', authController.authenticate);
routes.post('/auth/forgot_password', authController.forgot_password);
routes.post('/auth/reset_password', authController.reset_password);

routes.use(authMiddleware);

routes.get('/classes', classesController.index);
routes.post('/classes', classesController.create);

routes.get('/connections', connectionsController.index);
routes.post('/connections', connectionsController.create);

export default routes;