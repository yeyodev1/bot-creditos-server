import { body, check } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

import validateResults from '../utils/handleValidator';

export const financialDataDebtsValidator = [
  body('ctx.from')
    .trim()
    .notEmpty()
    .withMessage('Cellphone is required')
    .isMobilePhone('es-AR')
    .withMessage('Cellphone is not valid'),

  check('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string')
    .isIn(['Yes', 'No'])
    .withMessage('Message must be "Yes" or "No"'),

  (req: Request, res: Response, next: NextFunction) => {
    return validateResults(req, res, next);
  },
];