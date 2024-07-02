import { body, check } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

import validateResults from '../utils/handleValidator';

export const userValidatorCreate = [
  body('ctx.from')
    .trim()
    .notEmpty()
    .withMessage('Cellphone is required')
    .isMobilePhone('es-AR')
    .withMessage('Cellphone is not valid'),
    
  check('name')
    .optional()
    .isString()
    .withMessage('Name must be a string'),

  check('CUIL')
    .optional()
    .matches(/^\d{2}-\d{8}-\d{1}$/)
    .withMessage('CUIL is not valid'),
    
  check('email')
    .optional()
    .isEmail()
    .withMessage('Email is not valid'),

  check('age')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Age must be a non-negative integer'),

  check('financialData')
    .optional()
    .isMongoId()
    .withMessage('Financial Data must be a valid Mongo ID'),

  check('credit')
    .optional()
    .isMongoId()
    .withMessage('Credit must be a valid Mongo ID'),
    
  (req: Request, res: Response, next: NextFunction) => {
    return validateResults(req, res, next);
  },
];