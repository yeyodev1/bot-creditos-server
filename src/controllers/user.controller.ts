import { Request, Response } from 'express';

import handleHttpError from '../utils/handleError';
import { Ctx } from '../interfaces/ctx';
import models from '../models';

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    console.log('pasamos por aqui')
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
    const { from: number, body: message }: Ctx = req.body.ctx;
    
    const user = await models.user.findOne({cellphone: number});

    if (!user) {
      return handleHttpError(res, 'user not found');
    };

    let responseMessage: string;

    const hasFirstNameAndLastName = /\b\w+\b\s+\b\w+\b/.test(message);

    if (hasFirstNameAndLastName) {
      user.name = message;
      await user.save();
      responseMessage = 'Se ha guardado exitosamente tu nombre.';
    } else {
      responseMessage = 'El nombre debe contener al menos un nombre y un apellido.';
    };

    const response = {
      messages: [
        {
          type: 'to_user', 
          content: responseMessage
        }
      ]
    };

    res.status(200).send(response)
  } catch (error) {
    handleHttpError(res, 'cannot get user name');
  }
}