import express from 'express';

import {
	createUser,
	setUserName,
	setUserEmail,
	setUserCuil,
} from '../controllers/user.controller';

const router = express.Router();

router.post('/user', createUser);

router.post('/set-user-name', setUserName);
router.post('/set-user-email', setUserEmail);
router.post('/set-user-cuil', setUserCuil)

router.post('/')

export default router;