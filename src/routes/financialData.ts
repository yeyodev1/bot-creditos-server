import express from 'express';

import { verifyOtherDebs } from '../controllers/financialData.controller';
import { financialDataDebtsValidator } from '../validators/financialData.validator';

const router = express.Router();

router.post('/other-debts', financialDataDebtsValidator, verifyOtherDebs);

export default router;