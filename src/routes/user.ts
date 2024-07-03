import express from 'express';

import { createUser, setUserName } from '../controllers/user.controller';

const router = express.Router();

router.post('/user', createUser);

router.post('/set-user-name', setUserName);

export default router;``