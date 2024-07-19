export function validateBenefitNumber(benefitNumber: string): boolean {
  // Validate length of benefit number
  if (benefitNumber.length !== 11) {
      return false;
  }

  // Extract and validate prefix code
  const prefixCode = benefitNumber.substring(0, 2);
  const validPrefixCodes = ["20", "23", "24", "27", "30", "33", "34"];
  if (!validPrefixCodes.includes(prefixCode)) {
      return false;
  }

  // Extract base number and check digit
  const baseNumber = benefitNumber.substring(2, 10);
  const checkDigit = parseInt(benefitNumber[10]);

  // Calculate sum of weighted base numbers
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
      sum += parseInt(benefitNumber[i]) * weights[i];
  }

  // Calculate expected check digit
  const remainder = sum % 11;
  let calculatedCheckDigit: number;
  if (remainder === 0) {
      calculatedCheckDigit = 0;
  } else if (remainder === 1) {
      // In Argentina, a remainder of 1 has special handling
      calculatedCheckDigit = 9;
  } else {
      calculatedCheckDigit = 11 - remainder;
  }

  // Validate check digit
  return checkDigit === calculatedCheckDigit;
}
