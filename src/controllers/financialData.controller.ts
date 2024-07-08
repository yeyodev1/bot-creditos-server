import { Request, Response } from 'express';

import models from '../models';
import { Ctx } from '../interfaces/ctx.interface';
import handleHttpError from '../utils/handleError';


export async function verifyOtherDebs(req: Request, res: Response) {
  try {
    const { from: number, body: message }: Ctx = req.body;
    
    const existingUser = await models.user.findOne({cellphone: number}).populate('financialData');

    if(!existingUser?.financialData) {
      return handleHttpError(res, 'user has no financial data');
    }

    const otherDebs = message == 'Yes' ? true : false;
    const financialData = await models.financialData.findByIdAndUpdate(
      existingUser.financialData._id,
      { $set: { otherDebs } },
    );

    let responseMessage = 'Lamentablemente no podemos continuar con la solicitud de tu crédito 😔'
    if(otherDebs) {
      responseMessage = 'Perfecto podemos continuar con la solicitud de tu crédito 🚀';
    }

    const response = {
      messages: [
        {
          type: 'to_user',
          content: responseMessage,
        }
      ]
    }

    res.status(200).send(response);
  } catch (error) {
    handleHttpError(res, 'cannot verify if user has other debts')
  }
}