import path from 'node:path';
import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';

import models from '../models';
import handleHttpError from '../utils/handleError';
import GoogleCloudStorageUploader from '../services/GcpUploadService';
import type{ Ctx } from '../interfaces/ctx.interface';
import { extractPrefixAndNumber } from '../utils/extractPrefixAndNumber';
import { addRowsToSheet, objectDataSheet } from '../utils/handleSheetData';
import { CUITS_ORGANIZATIONS, IPS_CUIT } from '../variables/prefixes';
import { generateWhatsAppToken } from '../utils/generateToken';

const bucketName = 'botcreditos-bucket-images';
const keyFilenamePath = path.join(process.cwd(), '/gcpFilename.json');
const storage = new Storage({ keyFilename: keyFilenamePath });
const uploader = new GoogleCloudStorageUploader(storage, bucketName);

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { from: number }: Ctx = req.body.ctx;

    const {areaCode, restOfNumber} = extractPrefixAndNumber(number);
    objectDataSheet['codigo de area'] = areaCode;
    objectDataSheet['resto del numero'] = restOfNumber;

    await addRowsToSheet('resto del numero', restOfNumber);
    await addRowsToSheet('codigo de area', areaCode);
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
    handleHttpError(res, 'Cannot create user');
  };
};

export async function setUserName(req: Request, res: Response): Promise<void> {
  try {
    const { from: number, body: message }: Ctx = req.body.ctx;
    
    const user = await models.user.findOne({cellphone: number});
    const numbeParsed = extractPrefixAndNumber(number);

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
      objectDataSheet['email'] = foundEmail[0];
      await addRowsToSheet('email', foundEmail[0]);

    } else {
      responseMessage = '📧 Necesitas escribir un correo electrónico válido, por favor.';
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
      responseMessage = '⌛ Hemos guardado tu CUIL exitosamente ✅.\nProseguimos?';
      objectDataSheet['cuil'] = cuilFound[0];
      await addRowsToSheet('cuil', cuilFound[0]);
    } else {
      responseMessage = '❌ No he podido verificar el CUIL. Por favor, revisa y vuelve a intentarlo. \n\nSi crees que cometiste un error al ingresar tu CUIL, escribe *reintentar*.';
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

    const benefitNumberRegex = /^\d{3}\d{8}\d$/;
    const benefitNumberFound = message.match(benefitNumberRegex);

    if(benefitNumberFound) {
      user.benefitNumber = benefitNumberFound[0];
      await user.save();
      responseMessage = 'Tu número de beneficio se ha registrado exitosamente! ✅\n\Deseas proseguir con los últimos datos necesarios?';
      objectDataSheet['nro de beneficio'] = benefitNumberFound[0];
      await addRowsToSheet('nro de beneficio', benefitNumberFound[0]);
    } else {
      responseMessage = '❌ No he podido verificar el numero de beneficio. Por favor, revisa y vuelve a intentarlo escribiendo *reintentar*';
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
 
   const user = await models.user.findOne({cellphone: number});
 
   if (!user) {
     return handleHttpError(res, 'user not found');
   };
 
   if(!user.CUIT) {
     return handleHttpError(res, 'user cuit not found')
   }

   let responseMessage: string = ''

   if(user.CUIT === IPS_CUIT) {
    responseMessage = 'Excelente! Haz llenado los datos exitosamente.\n\nEscribe *vamos* para continuar.🔜';
   } else if ( user.CUIT && CUITS_ORGANIZATIONS[user.CUIT]) {
    responseMessage = 'Excelente! Haz llenado los datos exitosamente.\n\n Escribe *sigamos* para continuar.🔜';
   } else if ( user.CUIT && user.CUIT !== IPS_CUIT) {
    responseMessage = 'Excelente! Haz llenado los datos exitosamente.\n\n Escribe *proseguir* para continuar.🔜';
   };

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

export async function setUserMedia(req: Request, res: Response) {
  try {
    const { message, from }:Ctx = req.body.ctx    

    const user = await models.user.findOne({ cellphone: from });
    let responseMessage;

    if(!user) {
      return handleHttpError(res, 'user not found');
    };

    if (user.dorsoDni && user.reverseDni && user.salaryReceipt && user.certificateSalaryReceipt) {
      user.dorsoDni = '';
      user.reverseDni = '';
      user.salaryReceipt = '';
      user.certificateSalaryReceipt = '';
      await user.save(); 
    };

    const imageUrl = await uploader.uploadImageFromMessage(message);

    if(!user.dorsoDni) {
      responseMessage = '✅ ¡Tu frente de DNI se ha registrado exitosamente! 📄\n\nAhora envía el reverso';
      user.dorsoDni = imageUrl;
      objectDataSheet['foto de verso dni'] = imageUrl;  
      await addRowsToSheet('foto de anverso dni', imageUrl)

    }
    else if(!user.reverseDni) {
      if (user.CUIT === IPS_CUIT) {
        responseMessage = '✅ ¡El reverso de tu DNI se ha registrado exitosamente! 📄\n\nAhora envía tu último recibo de haberes';
      } else {
        responseMessage = '✅ ¡El reverso de tu DNI se ha registrado exitosamente!';
      }
      user.reverseDni = imageUrl;
      objectDataSheet['foto de anverso dni'] = imageUrl;
      await addRowsToSheet('foto de verso dni', imageUrl);

    }
    else if(!user.salaryReceipt && user.CUIT === IPS_CUIT) {
      responseMessage = '✅ ¡Tu recibo de haberes se ha registrado exitosamente! 📄\n\nAhora vamos a necesitar unos minutos para analizar tu solicitud, y darte una respuesta.';
      user.salaryReceipt = imageUrl;
      objectDataSheet['ultimo recibo de haberes'] = imageUrl;
      const token = generateWhatsAppToken();
      objectDataSheet['token'] = token;
      await addRowsToSheet('token', token)
    }
    else if(!user.salaryReceipt && user.CUIT !== IPS_CUIT) {
      responseMessage = '✅ ¡Tu recibo de haberes se ha registrado exitosamente! 📄\n\nAhora envía tu certificado de haberes por favor';
      user.salaryReceipt = imageUrl;
      objectDataSheet['ultimo recibo de haberes'] = imageUrl;
      const token = generateWhatsAppToken();
      objectDataSheet['token'] = token;
      await addRowsToSheet('token', token)
      await addRowsToSheet('ultimo recibo de haberes', imageUrl);
    }
    else if(!user.certificateSalaryReceipt && user.CUIT === IPS_CUIT) {
      responseMessage = '✅ ¡Tu certificado de haberes se ha registrado exitosamente! 📄\n\nAhora vamos a necesitar unos minutos para analizar tu solicitud, y darte una respuesta.';
      user.certificateSalaryReceipt = imageUrl
      await addRowsToSheet('certificado de haberes', imageUrl);
    }
    
    await user.save();

    const response = {
      messages: [
        {
          type: 'to_user',
          content: responseMessage,
        }
      ]
    };

    res.status(200).send(response);
  } catch (error) {
    handleHttpError(res, 'Cannot set user media');
  }
}