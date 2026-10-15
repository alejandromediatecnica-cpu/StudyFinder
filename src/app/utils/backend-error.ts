export type DetalleBackend = { detail?: unknown } | string | null;

export function mensajeDeErrorBackend(error: DetalleBackend | unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const cuerpo = (error as { error?: unknown }).error;
  if (cuerpo === null || cuerpo === undefined) return null;

  if (typeof cuerpo === 'string') {
    return cuerpo.trim() ? cuerpo : null;
  }
  if (typeof cuerpo !== 'object') return null;

  const detalle = (cuerpo as { detail?: unknown }).detail;
  if (typeof detalle === 'string' && detalle.trim()) return detalle;
  if (Array.isArray(detalle)) {
    const partes = detalle
      .map(item => {
        if (item && typeof item === 'object' && (item as { msg?: unknown }).msg) {
          return String((item as { msg: unknown }).msg);
        }
        return item ? String(item) : '';
      })
      .filter(Boolean);
    if (partes.length) return partes.join(' ');
  }
  return null;
}