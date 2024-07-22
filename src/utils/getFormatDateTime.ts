export function getFormattedDateTime(): string {
  const now = new Date();
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires'
  };

  const formatter = new Intl.DateTimeFormat('es-ES', options);
  const parts = formatter.formatToParts(now);

  const day = parts.find(part => part.type === 'weekday')?.value || '';
  const date = parts.filter(part => ['day', 'month', 'year'].includes(part.type)).map(part => part.value).join('/');
  const time = parts.filter(part => ['hour', 'minute', 'second'].includes(part.type)).map(part => part.value).join(':');

  return `${day}, ${date} ${time}`;
}
