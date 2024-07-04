import express from 'express';

import { userValidatorCreate } from '../validators/user.validator';
import { createUser, setUserName, getBenefitNumber, verifyCuitOrganizations, setUserEmail, setUserCuil } from '../controllers/user.controller';

const router = express.Router();

router.post('/')
router.post('/set-user-cuil', setUserCuil);
router.post('/set-user-name', setUserName);
router.post('/set-user-email', setUserEmail);
router.post('/user', userValidatorCreate, createUser);

router.get('/get-benefit-number', getBenefitNumber);
router.get('/verify-cuit-organizations', verifyCuitOrganizations);


export default router;