import express from 'express';

import { userHasCredit } from '../controllers/credit.controller';

const router = express.Router();


router.post('/user-has-credit', userHasCredit);

export default router;