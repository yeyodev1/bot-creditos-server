import axios from 'axios';

import { parsedNumber } from '../interfaces/parsedNumber.interface';
import { extractPrefixAndNumber } from '../utils/extractPrefixAndNumber';

export class BankService {
  async validateCreditApproval(cellphone: string, cuilNumber: string, email?: string,) {
    const { areaCode, restOfNumber}: parsedNumber = extractPrefixAndNumber(cellphone);

    // const internalData = {
    //   codigoDeArea: areaCode,
    //   telefonoRestante: restOfNumber,
    //   correo: email,
    //   numeroDeCuil: cuilNumber
    // };

    // const data = JSON.stringify(internalData);

    const response = await axios.get(`https://validador.m-sistemas.net.ar/api/v1/organismo/?cuil=${cuilNumber}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  };
};