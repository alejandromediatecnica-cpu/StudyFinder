// Genera src/environments/environment.ts a partir de `.env` y de las variables del sistema.
// Se ejecuta solo antes de `npm start`, `npm run build`, `npm run watch` y `npm test`.
// Las variables del sistema (p. ej. las definidas en Vercel) tienen prioridad sobre `.env`.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const apiUrl = (process.env.API_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
if (!/^https?:\/\/[^/\s]+/.test(apiUrl)) {
  console.error(`API_URL no es una URL http(s) válida: "${apiUrl}"`);
  process.exit(1);
}

mkdirSync('src/environments', { recursive: true });
writeFileSync(
  'src/environments/environment.ts',
  `// Archivo generado por scripts/generate-env.mjs a partir de .env. No editar a mano.
export const environment = {
  apiUrl: ${JSON.stringify(apiUrl)},
} as const;
`,
);
console.log(`environment.ts generado (API_URL=${apiUrl})`);
