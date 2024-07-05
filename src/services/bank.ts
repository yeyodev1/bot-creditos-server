import axios from 'axios';

import { parsedNumber } from '../interfaces/parsedNumber';
import { extractPrefixAndNumber } from '../utils/extractPrefixAndNumber';

export class BankService {
  async validateCreditApproval(cellphone: string, email: string, cuilNumber: string) {
    const { areaCode, restOfNumber}: parsedNumber = extractPrefixAndNumber(cellphone);

    const internalData = {
      codigoDeArea: areaCode,
      telefonoRestante: restOfNumber,
      correo: email,
      numeroDeCuil: cuilNumber
    };

    const data = JSON.stringify(internalData);

    const response = await axios.post(`https://validador.m-sistemas.net.ar/api/v1/organismo/?cuil=${cuilNumber}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data
  };
};