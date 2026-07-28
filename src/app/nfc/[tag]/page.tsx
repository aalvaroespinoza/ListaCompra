import { redirect } from 'next/navigation';

export default async function NFCPage({ params }: { params: Promise<{ tag: string }> }) {
  // Arquitectura para etiquetas NFC
  // Ejemplo: Un tag NFC en la cocina apunta a lista.com/nfc/cocina
  // Esta ruta captura el tag, prepara la app y redirige a la vista principal
  // aplicando los filtros o acciones necesarias.
  
  const resolvedParams = await params;
  
  // Se redirecciona inmediatamente para no romper la experiencia,
  // inyectando el tag como category para pre-filtrar o auto-seleccionar
  redirect(`/?category=${resolvedParams.tag}&nfc=true`);
}
