// Genera public/env.js con la URL del backend tomada de la variable de entorno
// API_URL. En Vercel se define en Project Settings -> Environment Variables y
// Vercel la inyecta en tiempo de build.
//
// Se ejecuta automaticamente antes de `ng build` (script "prebuild"), de modo
// que el bundle servido en produccion apunta al backend correcto sin tener que
// tocar el codigo. Si API_URL no esta definida, deja el archivo por defecto
// (la app usa entonces environment.apiUrl).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const target = join(here, '..', 'public', 'env.js');
const apiUrl = (process.env.API_URL ?? '').trim();

const contents = apiUrl
  ? `window.__STUDYFINDER_ENV__ = ${JSON.stringify({ apiUrl })};\n`
  : 'window.__STUDYFINDER_ENV__ = window.__STUDYFINDER_ENV__ || {};\n';

writeFileSync(target, contents, 'utf8');
console.log(`env.js generado: apiUrl=${apiUrl || '(vacio: se usa environment.apiUrl)'}`);
