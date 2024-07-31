export function handleBotAvailability(user: any, allFieldsFilled: string | true | null | undefined, twoDaysAgo: Date) {
  const lastUpdatedMoreThanTwoDaysAgo = new Date(user?.updatedAt!) <= twoDaysAgo;
  let isUserAllow = 'permitido';
  if (allFieldsFilled && !lastUpdatedMoreThanTwoDaysAgo) {
    isUserAllow = 'permitido';
  }
  return isUserAllow;
}