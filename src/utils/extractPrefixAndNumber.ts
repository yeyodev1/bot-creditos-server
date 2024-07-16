import { parsedNumber } from '../interfaces/parsedNumber.interface';
import { WHATSAPP_ARGENTINA_PREFIXES, WHATSAPP_ECUADOR_PREFIXES } from '../variables/prefixes';

export function extractPrefixAndNumber(phoneNumber: string): parsedNumber {

  let localPhoneNumber: string;

  if (phoneNumber.startsWith('549')) {
    localPhoneNumber = phoneNumber.slice(3);
  } else if (phoneNumber.startsWith('593')) {
    localPhoneNumber = phoneNumber.slice(3);
  } else {
    throw new Error('The number doesn\'t start with 549 or 593 prefix');
  }

  const ALL_PREFIXES = [...WHATSAPP_ARGENTINA_PREFIXES, ...WHATSAPP_ECUADOR_PREFIXES];

  for (const prefix of ALL_PREFIXES) {
    const prefixParsed = prefix.replace(/\s+/g, '');
    if ( localPhoneNumber.startsWith(prefixParsed)) {
      const areaCode = prefixParsed;
      const restOfNumber = localPhoneNumber.slice(prefixParsed.length);
      return { areaCode, restOfNumber };
    };
  };
  throw new Error('Prefix not found');
};