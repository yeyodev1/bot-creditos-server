import express from 'express';

import {
	createUser,
	setUserName, 
	setUserCuil,
	setUserEmail,
	getBenefitNumber, 
	verifyCuitOrganizations,
} from '../controllers/user.controller';
import { userValidatorCreate } from '../validators/user.validator';

const router = express.Router();

router.post('/');
router.post('/set-user-name', setUserName);
router.post('/set-user-cuil', setUserCuil);
router.post('/set-user-email', setUserEmail);
router.post('/user', userValidatorCreate, createUser);

router.get('/get-benefit-number', getBenefitNumber);
router.get('/verify-cuit-organizations', verifyCuitOrganizations);

export default router;