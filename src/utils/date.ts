// utils/formatDate.ts
export function formatDateFR(isoDate: string): string {
  const date = new Date(isoDate);

  // Vérifier si la date est valide
  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}
