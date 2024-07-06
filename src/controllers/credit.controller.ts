import { Request, Response } from 'express';

import models from '../models';
import { BankService } from '../services/bank';
import handleHttpError from '../utils/handleError';

import type { Ctx } from '../interfaces/ctx.interface';
import type { ApiResponseBank } from '../interfaces/bankRequest.interface';

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
    
    const credit: ApiResponseBank = await bankService.validateCreditApproval("5491137815322", user.CUIL, user.email);

    let message;
    if(credit) {
      user.CUIT = credit.objects[0].cuit;
      console.log('user: ', user);
      await user.save();
      message = 'perfecto, puedes solicitar un crédito'
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