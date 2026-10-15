import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// En local se leen las variables de `.env`; en el hosting llegan del entorno del proceso,
// que tiene prioridad. Los hosts permitidos salen de NG_ALLOWED_HOSTS (ver .env.example).
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Configuracion en tiempo de ejecucion para el navegador.
 *
 * La URL del backend se lee de la variable de entorno API_URL y se expone como
 * /env.js, que index.html carga antes de la app. Asi no hay que reconstruir el
 * frontend para apuntar a otro backend. Debe declararse antes del estatico para
 * tener prioridad sobre public/env.js.
 */
app.get('/env.js', (_req, res) => {
  const apiUrl = process.env['API_URL'] ?? '';
  res.type('application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`window.__STUDYFINDER_ENV__ = ${JSON.stringify({ apiUrl })};`);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Servidor SSR escuchando en el puerto ${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
