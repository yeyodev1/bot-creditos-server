import axios from 'axios';

export class BankService {
  async validateCreditApproval(cuilNumber: string) {
    
    const response = await axios.get(`https://validador.m-sistemas.net.ar/api/v1/organismo/?cuil=${cuilNumber}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  };
};