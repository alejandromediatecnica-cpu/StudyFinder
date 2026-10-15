import { environment } from '../../environments/environment';

export interface RuntimeConfig {
  apiUrl?: string;
}

declare global {
  interface Window {
    __STUDYFINDER_ENV__?: RuntimeConfig;
  }
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function fromBrowser(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return window.__STUDYFINDER_ENV__?.apiUrl;
}

function fromNode(): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.['API_URL'];
}

/**
 * URL base de la API. Prioridad:
 *   1. Configuracion de ejecucion: `window.__STUDYFINDER_ENV__.apiUrl` en el
 *      navegador o `API_URL` en el servidor (SSR).
 *   2. Valor por defecto de `environment.apiUrl`.
 */
export function apiBaseUrl(): string {
  const configured =
    typeof window === 'undefined'
      ? firstNonEmpty(fromNode(), environment.apiUrl)
      : firstNonEmpty(fromBrowser(), environment.apiUrl);
  return configured.replace(/\/+$/, '');
}

/** Construye una URL absoluta de la API a partir de una ruta relativa. */
export function apiEndpoint(path: string): string {
  const base = apiBaseUrl();
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
