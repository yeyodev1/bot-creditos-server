import { Request, Response } from 'express';

import models from '../models';
import handleHttpError from '../utils/handleError';
import { addRowsToSheet, objectDataSheet } from '../utils/handleSheetData';
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

    const {areaCode, restOfNumber} = extractPrefixAndNumber(number);
    objectDataSheet['codigo de area'] = areaCode;
    objectDataSheet['resto del numero'] = restOfNumber;

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
      objectDataSheet['nombre'] = message;
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
      objectDataSheet['email'] = foundEmail[0];
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
      objectDataSheet['cuil'] = cuilFound[0];
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

export async function setBenefitNumber(req: Request, res: Response) {
  try {
    const { from: number, body: message } : Ctx = req.body.ctx;

    const user = await models.user.findOne({ cellphone: number });

    if(!user) {
      return handleHttpError(res, 'User not found');
    }

    let responseMessage: string;

    const benefitNumberRegex = /^\d{3}-\d{3}-\d{3}-\d{3}-\d{3}|\d{3}\.\d{3}\.\d{3}\.\d{3}\.\d{3}|\d{15}$/;
    const benefitNumberFound = message.match(benefitNumberRegex);

    if(benefitNumberFound) {
      user.benefitNumber = benefitNumberFound[0];
      await user.save();
      responseMessage = 'Tu número de beneficio se ha registrado exitosamente! ✅';
      objectDataSheet['nro de beneficio'] = benefitNumberFound[0];
    } else {
      responseMessage = '❌ No he podido verificar el numero de beneficio. Por favor, revisa y vuelve a intentarlo. 😊';
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
    handleHttpError(res, 'cannot set user benefit number')
  }
}

export async function getBenefitNumber(req: Request, res: Response) {
  try {
    const { from: number, body: message }: Ctx = req.body.ctx;

    const user = await models.user.findOne({cellphone: number});
    
    if (!user) {
      return handleHttpError(res, 'user not found');
    };

    let responseMessage = 'Ups no tienes un número de beneficio registrado 😔';

    if(user.benefitNumber) {
      responseMessage = `Tu número de beneficio es: ${user.benefitNumber} 🚀` 
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
    handleHttpError(res, 'cannot get benefit number')
  }
}

export async function verifyCuitOrganizations(req: Request, res: Response) {
  try {
   const { from: number }: Ctx = req.body.ctx;
   console.log('estamos verificando organizaciones ptm: ', req.body.ctx);
 
   const user = await models.user.findOne({cellphone: number});
 
   if (!user) {
     return handleHttpError(res, 'user not found');
   };
 
   if(!user.CUIT) {
     return handleHttpError(res, 'user cuit not found')
   }

   const responseMessage = `🔍 ¿Este es el organismo que te paga los haberes: ${user.CUIT}?`

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