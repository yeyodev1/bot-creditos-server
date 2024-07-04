import express from 'express';

import { createUser, setUserName, getBenefitNumber, verifyCuitOrganizations } from '../controllers/user.controller';
import { userValidatorCreate } from '../validators/user.validator';

const router = express.Router();

router.post('/user', userValidatorCreate, createUser);

router.post('/set-user-name', setUserName);

router.get('/get-benefit-number', getBenefitNumber);

router.get('/verify-cuit-organizations', verifyCuitOrganizations);

export default router;