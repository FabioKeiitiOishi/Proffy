import express from 'express';

import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import AuthController from './controllers/AuthController';

import authMiddleware from './middlewares/auth';

const routes = express.Router();
const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const authController = new AuthController();

routes.post('/auth/register', authController.register);
routes.post('/auth/authenticate', authController.authenticate);

routes.use(authMiddleware);

routes.get('/classes', classesController.index);
routes.post('/classes', classesController.create);

routes.get('/connections', connectionsController.index);
routes.post('/connections', connectionsController.create);

export default routes;