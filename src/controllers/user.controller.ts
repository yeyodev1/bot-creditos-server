import { Request, Response } from 'express';

import handleHttpError from '../utils/handleError';
import { Ctx } from '../interfaces/ctx';
import models from '../models';

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { from: number }: Ctx = req.body.ctx;

    const existingUser = await models.user.findOne({ cellphone: number });
    
    if(existingUser) {
      res.status(200).send({ message: 'user exists', user: existingUser });
      return;
    };

    const userData = new models.user({
      cellphone: number,
    });

    await userData.save();
    
    res.status(200).send('user created succesfully');
  } catch (error) {
    console.error('error: ', error)
    handleHttpError(res, 'Cannot create user');
  };
};

export async function setUserName(req: Request, res: Response): Promise<void> {
  try {
    const { from: number, body: message }: Ctx = req.body;
    
    const user = await models.user.findOne({cellphone: number});

    if (!user) {
      return handleHttpError(res, 'user not found');
    };

    user.name = message;
    await user.save();

    res.status(200).send({message: 'user name saved'})
  } catch (error) {
    handleHttpError(res, 'cannot get user name');
  }
}

export async function getBenefitNumber(req: Request, res: Response) {
  try {
    const { from: number, body: message }: Ctx = req.body.ctx;

    const user = await models.user.findOne({cellphone: number});
    
    if (!user) {
      return handleHttpError(res, 'user not found');
    };

    if(!user.CUIT) {
      return handleHttpError(res, 'user cuit not found')
    }
    
    user.benefitNumber = message;
    await user.save();

    res.status(200).send({message: 'benefit number saved'})
  } catch (error) {
    handleHttpError(res, 'cannot get benefit number')
  }
}

export async function verifyCuitOrganizations(req: Request, res: Response) {
  try {
   const { from: number }: Ctx = req.body.ctx;
 
   const user = await models.user.findOne({cellphone: number});
 
   if (!user) {
     return handleHttpError(res, 'user not found');
   };
 
   if(!user.CUIT) {
     return handleHttpError(res, 'user cuit not found')
   }

   const responseMessage = `🔍 Verifícanos por favor si este es el organismo que te paga los haberes: ${user.CUIT} ✅`

   const response = {
    messages: [
      {
        type: 'to_user',
        content: responseMessage,
      }
    ]
   }
 
   res.status(200).send(response)
  } catch (error) {
    handleHttpError(res, 'cannot verify cuit organizations')
  } 
 }