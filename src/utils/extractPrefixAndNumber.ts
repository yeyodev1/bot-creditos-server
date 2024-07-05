import { parsedNumber } from '../interfaces/parsedNumber';
import { WHATSAPP_ARGENTINA_PREFIXES } from '../variables/prefixes';

export function extractPrefixAndNumber(phoneNumber: string): parsedNumber {

  if (!phoneNumber.startsWith('549')) {
    throw new Error('the number doesnt start width 549 prefix');
  };

  const localPhoneNumber = phoneNumber.slice(3);

  for (const prefix of WHATSAPP_ARGENTINA_PREFIXES) {
    const prefixParsed = prefix.replace(/\s+/g, '');
    if ( localPhoneNumber.startsWith(prefixParsed)) {
      const areaCode = prefixParsed;
      const restOfNumber = localPhoneNumber.slice(prefixParsed.length);
      return { areaCode, restOfNumber };
    };
  };
  throw new Error('Prefix not found');
};