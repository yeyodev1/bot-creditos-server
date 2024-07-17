export function generateWhatsAppToken(): string {
  const prefix = "whats";
  
  const length = 27;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let segment = '';
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      segment += characters[randomIndex];
  }
  const token = prefix + segment;
  
  return token;
}