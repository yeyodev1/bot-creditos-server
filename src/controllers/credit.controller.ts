import { Request, Response } from 'express';

import models from '../models';
import { BankService } from '../services/bank';
import handleHttpError from '../utils/handleError';

import type { Ctx } from '../interfaces/ctx.interface';
import { addRowsToSheet, objectDataSheet } from '../utils/handleSheetData';
import type { ApiResponseBank } from '../interfaces/bankRequest.interface';
import { CUITS_ORGANIZATIONS, IPS_CUIT } from '../variables/prefixes';

const bankService = new BankService();


export async function userHasCredit (req: Request, res: Response): Promise<void> {
  try {
    const { from: number }: Ctx = req.body.ctx;
    console.log('estamos viendo si hay creditooo');

    const user = await models.user.findOne({ cellphone: number});
    console.log('usuario: ', user);
    
    if(!user) {
      return handleHttpError(res, 'user not found')
    };

    if(!user.email) {
      return handleHttpError(res, 'user not has email');
    }
    if(!user.CUIL) {
      return handleHttpError(res, 'user has not cuil');
    };
    console.log('despues de los ifsss')
    
    let message: string;
    console.log('antesd de consultar si hay credito')
    const credit: ApiResponseBank = await bankService.validateCreditApproval("5491137815322", user.CUIL, user.email);
    console.log('despues de consultar si hay credito')
    console.log('credito: ', credit)
    if (credit.objects[0]) {
      const { cuit } = credit.objects[0];
      user.CUIT = cuit;
  
      if (cuit in CUITS_ORGANIZATIONS) {
        const userCuitOrg = CUITS_ORGANIZATIONS[cuit as keyof typeof CUITS_ORGANIZATIONS];
        message = `Hemos identificado que sos empleado de ${userCuitOrg} y tenemos las mejores condiciones para ofrecerte el crédito con cobro por descuento de haberes (Decreto 14-2012).\n\nPara continuar con la validación escribe *continuar* ✅`;
      } else if (cuit === IPS_CUIT) {
        message = `Hemos identificado que sos beneficiario de IPS Provincia de Bs As y tenemos buenas condiciones para ofrecerte el crédito con cobro por descuento de haberes. 
        El monto de estos créditos lo determina IPS según el cupo que tengas disponible. 😊\n\nPara continuar con la validación escribe *continuar* ✅`;
      } else {
        message = 'Hemos verificado tu CUIT. 😊\n\nPara continuar con la validación escribe *continuar* ✅';
      }
    
      objectDataSheet['cuit'] = cuit;
      await addRowsToSheet('cuit', cuit);
      
      console.log('user: ', user);
      await user.save();
    } else {
      message = 'Lo sentimos, no tenemos una línea de crédito que se ajuste a ti. 😔\n\n Podrás repetir el procedimiento en una próxima ocasión';
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