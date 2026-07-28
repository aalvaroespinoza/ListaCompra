/**
 * Helpers para manejo de fechas.
 * Por ahora se utilizan las APIs nativas de JS (Intl), 
 * pero queda preparado por si se requiere `date-fns` en el futuro.
 */

export function formatDateRelative(dateString: string): string {
  const date = new Date(dateString);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  
  const daysDifference = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference === 0) return "Hoy";
  if (daysDifference === 1) return "Mañana";
  if (daysDifference === -1) return "Ayer";
  
  return rtf.format(daysDifference, "day");
}
