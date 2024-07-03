import express from 'express';

import { createUser, setUserName } from '../controllers/user.controller';
import { userValidatorCreate } from '../validators/user.validator';

const router = express.Router();

router.post('/user', userValidatorCreate, createUser);

router.post('/set-user-name', setUserName);

export default router;