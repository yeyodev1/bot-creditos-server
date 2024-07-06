import { Request, Response } from 'express';

import models from '../models';
import handleHttpError from '../utils/handleError';
import { extractPrefixAndNumber } from '../utils/extractPrefixAndNumber';

import type{ Ctx } from '../interfaces/ctx.interface';

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { from: number }: Ctx = req.body.ctx;
    console.log('andamos creando user');

    const existingUser = await models.user.findOne({ cellphone: number });
    
    if(existingUser) {
      res.status(200).send({ message: 'user exists', user: existingUser });
      return;
    };

    const userData = new models.user({
      cellphone: number,
    });
    console.log(userData)

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
    console.log('colocamos nombreee')
    
    const user = await models.user.findOne({cellphone: number});
    const numbeParsed = extractPrefixAndNumber(number);
    console.log('numero parseado: ', numbeParsed)

    if (!user) {
      return handleHttpError(res, 'user not found');
    };

    let responseMessage: string;

    const hasFirstNameAndLastName = /\b\w+\b\s+\b\w+\b/.test(message);

    if (hasFirstNameAndLastName) {
      user.name = message;
      await user.save();
      responseMessage = '✅ ¡Tu nombre se ha registro exitosamente!';
    } else {
      responseMessage = '📌 El nombre debe contener al menos un nombre y un apellido. 😊';
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
    handleHttpError(res, 'cannot set user name');
  };
};

export async function setUserEmail (req: Request, res: Response) {
  try {
    const { from: number, body: message } : Ctx = req.body.ctx;

    const user = await models.user.findOne( {cellphone: number });

    if(!user) {
      return handleHttpError(res, 'user not found');
    }

    
    let responseMessage: string;

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const foundEmail = message.match(emailRegex);

    if (foundEmail) {
      user.email = foundEmail[0];
      await user.save();
      responseMessage = '✅ ¡Tu correo electrónico se ha registrado exitosamente! 📧';
    } else {
      responseMessage = '📧 Necesitas escribir un correo electrónico válido, por favor. 😊';
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
    handleHttpError(res, 'cannot set user email');
  };
};

export async function setUserCuil(req: Request, res: Response) {
  try {
    const {from: number, body: message} : Ctx = req.body.ctx;

    const user = await models.user.findOne({ cellphone: number });

    if(!user) {
      return handleHttpError(res, 'User not found');
    }

    let responseMessage: string;

    const cuilRegex = /^\d{2}-\d{8}-\d{1}$|^\d{11}$/;
    const cuilFound = message.match(cuilRegex);

    if(cuilFound) {
      user.CUIL = cuilFound[0];
      await user.save();
      responseMessage = '⌛ Dame unos minutos mientras verifico tu CUIL, por favor. 😊';
    } else {
      responseMessage = '❌ No he podido verificar el CUIL. Por favor, revisa y vuelve a intentarlo. 😊';
    };

    const response = {
      messages: [
        {
          type: 'to_user', 
          content: responseMessage
        }
      ]
    };

    res.status(200).send(response);
  } catch (error) {
    handleHttpError(res, 'cannot set user cuil')
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

    const responseMessage = '✅ ¡Tu número de beneficio se ha registrado exitosamente!';

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