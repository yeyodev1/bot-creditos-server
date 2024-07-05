import { WHATSAPP_ARGENTINA_PREFIXES } from "../variables/prefixes";

interface parsedNumber {
  areaCode: string;
  restOfNumber: string
}

export function extractPrefixAndNumber(phoneNumber: string): parsedNumber | string  {

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
  return 'prefix not found';
};