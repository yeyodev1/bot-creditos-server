import { Request, Response } from 'express';

import handleHttpError from '../utils/handleError';
import models from '../models';
import type { Ctx } from '../interfaces/ctx';
import { BankService } from '../services/bank';

const bankService = new BankService();


export async function userHasCredit (req: Request, res: Response): Promise<void> {
  try {
    const { from: number }: Ctx = req.body.ctx;
    console.log('estamos viendo si hay creditooo');

    const user = await models.user.findOne({ cellphone: number});
    
    if(!user) {
      return handleHttpError(res, 'user not found')
    };

    if(!user.email) {
      return handleHttpError(res, 'user not has email');
    }
    if(!user.CUIL) {
      return handleHttpError(res, 'user has not cuil');
    };
    
    const credit = await bankService.validateCreditApproval("5491137815322", user.email, user.CUIL);

    let message;
    if(credit) {
      message = 'perfecto, si tienes credito'
    } else {
      message = 'lo sentimos, no tienes credito'
    }

    const response = {
      messages: [
        {
          type: 'to_user',
          content: message
        }
      ]
    }

    res.status(200).send(response);
  } catch (error) {
    console.error('errorsote: ', error)
    return handleHttpError(res, 'cannot get data about user credit');
  }
}