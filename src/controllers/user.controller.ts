import path from 'node:path';
import crypto from 'node:crypto';
import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';

import models from '../models';
import handleHttpError from '../utils/handleError';
import GoogleCloudStorageUploader from '../services/GcpUploadService';
import type{ Ctx } from '../interfaces/ctx.interface';
import { extractPrefixAndNumber } from '../utils/extractPrefixAndNumber';
import { CUITS_ORGANIZATIONS, IPS_CUIT } from '../variables/prefixes';
import { generateWhatsAppToken } from '../utils/generateToken';
import { addRowsToSheet } from '../utils/handleSheetData';
import { getFormattedDateTime } from '../utils/getFormatDateTime';

const bucketName = 'botcreditos-bucket-images';
const keyFilenamePath = path.join(process.cwd(), '/gcpFilename.json');
const storage = new Storage({ keyFilename: keyFilenamePath });
const uploader = new GoogleCloudStorageUploader(storage, bucketName);

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { from: number }: Ctx = req.body.ctx;

    const sheetRowID = crypto.randomUUID();
    const {areaCode, restOfNumber} = extractPrefixAndNumber(number);

    await addRowsToSheet('uuid', sheetRowID);
    await addRowsToSheet('resto del numero', restOfNumber);
    await addRowsToSheet('codigo de area', areaCode);
    await addRowsToSheet('inicio de chat', getFormattedDateTime());

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
      responseMessage = '¡Tu nombre se ha registro exitosamente!';
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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const foundEmail = message.match(emailRegex);

    let validEmail: string
    if (foundEmail) {
      user.email = foundEmail[0];
      validEmail = 'valido';
      await user.save();
      responseMessage = '¡Tu correo electrónico se ha registrado exitosamente!';
      await addRowsToSheet('email', foundEmail[0]);

    } else {
      validEmail = 'invalido';
      responseMessage = 'Necesitas escribir un correo electrónico válido, por favor.';
    };

    const response = {
      messages: [
        {
          type: 'to_user', 
          content: responseMessage
        }
      ],
      validEmail
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
    
    let cuilValid: string;

    if(cuilFound) {
      cuilValid = "valido";
      user.CUIL = cuilFound[0];
      await user.save();
      responseMessage = 'Hemos verificado tu CUIL exitosamente.';
      await addRowsToSheet('cuil', cuilFound[0]);
    } else {
      cuilValid = "invalido"
      responseMessage = 'No he podido verificar el CUIL. Por favor, revisa y vuelve a intentarlo. \n\nSi crees que cometiste un error al ingresar tu CUIL, vamos pedirlo nuevamente';
      let found = cuilFound;
    };

    const response = {
      messages: [
        {
          type: 'to_user', 
          content: responseMessage
        }
      ],
      userCuilValid: cuilValid,
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

    const benefitNumberRegex = /^\d{11}$/;
    const benefitNumberFound = message.match(benefitNumberRegex);

    let benefitNumberValid: string;

    if(benefitNumberFound) {
      benefitNumberValid = 'valido';
      user.benefitNumber = benefitNumberFound[0];
      await user.save();
      responseMessage = 'Tu número de beneficio se ha registrado exitosamente!';
      await addRowsToSheet('nro de beneficio', benefitNumberFound[0]);
    } else {
      benefitNumberValid = 'invalido';
      responseMessage = 'No he podido verificar el numero de beneficio.';
    };

    const response = {
      messages: [
        {
          type: 'to_user', 
          content: responseMessage
        }
      ],
      benefitNumberValid
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

    let responseMessage = 'Ups no tienes un número de beneficio registrado';

    if(user.benefitNumber) {
      responseMessage = `Tu número de beneficio es: ${user.benefitNumber}` 
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
   };

   const response = {
    messages: [],
    userCuit: user.CUIT,
   }
 
   res.status(200).send(response)
  } catch (error) {
    handleHttpError(res, 'cannot verify cuit organizations')
  } 
}

export async function setUserMedia(req: Request, res: Response) {
  try {
    const { message, from }: Ctx = req.body.ctx;
    const user = await models.user.findOne({ cellphone: from });

    if (!user) {
      return handleHttpError(res, 'user not found');
    }

    const imageUrl = await uploader.uploadImageFromMessage(message);

    const isEstadoMayor = CUITS_ORGANIZATIONS[user.CUIT as string] === 'Estado Mayor General de la Armada';

    if (user.dorsoDni && user.reverseDni && user.salaryReceipt && !isEstadoMayor) {
      user.dorsoDni = '';
      user.reverseDni = '';
      user.salaryReceipt = '';
    } 
    else if (user.dorsoDni && user.reverseDni && user.salaryReceipt && user.certificateSalaryReceipt && isEstadoMayor) {
      user.dorsoDni = '';
      user.reverseDni = '';
      user.salaryReceipt = '';
      user.certificateSalaryReceipt = '';
    }

    let responseMessage = '';

    if(user.CUIT) {
      if (!user.dorsoDni) {
        user.dorsoDni = imageUrl;
        responseMessage = '¡Tu frente de DNI se ha registrado exitosamente! 📄\n\nAhora envía el reverso';
        await addRowsToSheet('foto de anverso dni', imageUrl);
      } else if (!user.reverseDni) {
        user.reverseDni = imageUrl;
        responseMessage = '¡El reverso de tu DNI se ha registrado exitosamente! 📄\n\nAhora envía tu último recibo de haberes';
        await addRowsToSheet('foto de verso dni', imageUrl);
      } else if (!user.salaryReceipt) {
        user.salaryReceipt = imageUrl;
        responseMessage = '¡Tu recibo de haberes se ha registrado exitosamente! 📄\n\n';
  
        if (isEstadoMayor) {
          responseMessage += 'Ahora envía tu certificado haberes.';
        } else {
          responseMessage += 'Ahora vamos a necesitar unos minutos para analizar tu solicitud, y darte una respuesta.';
          const token = generateWhatsAppToken();
          await addRowsToSheet('token', token);
        }
        
        await addRowsToSheet('ultimo recibo de haberes', imageUrl);
        await addRowsToSheet('final de chat', getFormattedDateTime());
      } else if (!user.certificateSalaryReceipt && isEstadoMayor) {
        const token = generateWhatsAppToken();
        user.certificateSalaryReceipt = imageUrl;
        responseMessage = '¡Tu certificado de haberes se ha registrado exitosamente! 📄\n\nAhora vamos a necesitar unos minutos para analizar tu solicitud, y darte una respuesta.';
        await addRowsToSheet('certificado de haberes', imageUrl);
        await addRowsToSheet('certificado de haberes', getFormattedDateTime());
        await addRowsToSheet('token', token);
      }
    } else {
      responseMessage = 'Antes de enviar documentación pídeme hacer una solicitud de crédito, por favor';
    };

    await user.save();

    const response = {
      messages: [
        {
          type: 'to_user',
          content: responseMessage,
        },
      ],
    };

    res.status(200).send(response);
  } catch (error) {
    handleHttpError(res, 'Cannot set user media');
  }
}

export async function setUserMediaByPDF(req: Request, res: Response) {
  try {
    const { message, from, urlTempFile }: Ctx = req.body.ctx;
    const user = await models.user.findOne({ cellphone: from });

    if (!user) {
      return handleHttpError(res, 'user not found');
    }

    let imageUrl;
    try {
      imageUrl = await uploader.uploadPDFMessage(message);
    } catch (error) {
      console.log('Handling as image due to error:', error);
      if (urlTempFile) {
        imageUrl = urlTempFile;
      } else {
        return handleHttpError(res, 'Cannot process file');
      }
    }

    const isEstadoMayor = CUITS_ORGANIZATIONS[user.CUIT as string] === 'Estado Mayor General de la Armada';

    if (user.dorsoDni && user.reverseDni && user.salaryReceipt && !isEstadoMayor) {
      user.dorsoDni = '';
      user.reverseDni = '';
      user.salaryReceipt = '';
    } 
    else if (user.dorsoDni && user.reverseDni && user.salaryReceipt && user.certificateSalaryReceipt && isEstadoMayor) {
      user.dorsoDni = '';
      user.reverseDni = '';
      user.salaryReceipt = '';
      user.certificateSalaryReceipt = '';
    }

    let responseMessage = '';

    if(user.CUIT) {
      if (!user.dorsoDni) {
        user.dorsoDni = imageUrl;
        responseMessage = '¡Tu frente de DNI se ha registrado exitosamente!\n\nAhora envía el reverso';
        await addRowsToSheet('foto de anverso dni', imageUrl);
      } else if (!user.reverseDni) {
        user.reverseDni = imageUrl;
        responseMessage = '¡El reverso de tu DNI se ha registrado exitosamente!\n\nAhora envía tu último recibo de haberes';
        await addRowsToSheet('foto de verso dni', imageUrl);
      } else if (!user.salaryReceipt) {
        user.salaryReceipt = imageUrl;
        responseMessage = '¡Tu recibo de haberes se ha registrado exitosamente!\n\n';
  
        if (isEstadoMayor) {
          responseMessage += 'Ahora envía tu certificado haberes.';
        } else {
          responseMessage += 'Ahora vamos a necesitar unos minutos para analizar tu solicitud, y darte una respuesta.';
          const token = generateWhatsAppToken();
          await addRowsToSheet('token', token);
        };
  
        
        await addRowsToSheet('ultimo recibo de haberes', imageUrl);
        
        await addRowsToSheet('final de chat', getFormattedDateTime());
      } else if (!user.certificateSalaryReceipt && isEstadoMayor) {
        const token = generateWhatsAppToken();
        user.certificateSalaryReceipt = imageUrl;
        responseMessage = '¡Tu certificado de haberes se ha registrado exitosamente!\n\nAhora vamos a necesitar unos minutos para analizar tu solicitud, y darte una respuesta.';
        
        await addRowsToSheet('token', token);
        await addRowsToSheet('certificado de haberes', imageUrl);
        await addRowsToSheet('final de chat', getFormattedDateTime());
      }
    } else {
      responseMessage = 'Antes de enviar documentación pídeme hacer una solicitud de crédito, por favor';
    }

    await user.save();

    const response = {
      messages: [
        {
          type: 'to_user',
          content: responseMessage,
        },
      ],
    };

    res.status(200).send(response);
  } catch (error) {
    console.error('Error in setUserMediaByPDF:', error);
    const response = {
      messages: [
        {
          type: 'to_user',
          content: 'Lo siento, ahora hay un problema con la toma de datos por archivo. Por favor, envía una foto o una captura del archivo',
        },
      ],
    };
    res.status(200).send(response);
  };
};

export async function verifyBotAvailability(req: Request, res: Response) {
  try {
    const { from }: { from: string } = req.body.ctx;

    const user = await models.user.findOne({ cellphone: from });
    console.log('user: ', user);

    let isUserAllow = 'permitido';

    const isEstadoMayor = CUITS_ORGANIZATIONS[user?.CUIT as string] === 'Estado Mayor General de la Armada';
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    const allFieldsFilled = user?.dorsoDni && user.reverseDni && user.salaryReceipt && (isEstadoMayor ? user.certificateSalaryReceipt : true);
    const lastUpdatedMoreThanTwoDaysAgo = new Date(user?.updatedAt!) <= twoDaysAgo;

    if (user?.CUIT) {
      if (isEstadoMayor) {
        if (allFieldsFilled && !lastUpdatedMoreThanTwoDaysAgo) {
          isUserAllow = 'no permitido';
        }
      } else {
        if (allFieldsFilled && !lastUpdatedMoreThanTwoDaysAgo) {
          isUserAllow = 'no permitido';
        }
      }
    }

    const response = {
      messages: [],
      isUserAllow
    };
    console.log('response: ', response);

    res.status(200).send(response);
  } catch (error) {
    console.error('errorsote: ', error);
    handleHttpError(res, 'cannot check availability for specific user');
  }
}