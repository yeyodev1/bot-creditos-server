import { Request, Response } from 'express';

import models from '../models';
import { Ctx } from '../interfaces/ctx';
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

    res.status(200).send({ message: 'other debs saved', financialData });    
  } catch (error) {
    handleHttpError(res, 'cannot verify if user has other debts')
  }
}