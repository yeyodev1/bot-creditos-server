import express from 'express';

import {
	createUser,
	setUserName, 
	setUserCuil,
	setUserEmail,
	setUserDorsoDni,
	setUserReverseDni,
	setUserSalaryReceipt,
	setBenefitNumber,
	getBenefitNumber, 
	verifyCuitOrganizations,
} from '../controllers/user.controller';
import { userValidatorCreate } from '../validators/user.validator';

const router = express.Router();

router.post('/set-user-name', setUserName);
router.post('/set-user-cuil', setUserCuil);
router.post('/set-user-email', setUserEmail);
router.post('/set-user-dorso-dni', setUserDorsoDni);
router.post('/set-user-reverse-dni', setUserReverseDni);
router.post('/set-user-salary-receipt', setUserSalaryReceipt);
router.post('/user', userValidatorCreate, createUser);
router.post('/set-user-benefit-number', setBenefitNumber);

router.post('/get-benefit-number', getBenefitNumber);
router.post('/verify-cuit-organizations', verifyCuitOrganizations);

export default router;