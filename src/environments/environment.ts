// Configuracion por defecto del frontend.
//
// `apiUrl` es solo el respaldo en tiempo de compilacion. En tiempo de
// ejecucion se puede sobrescribir con la variable de entorno `API_URL`
// (ver src/server.ts y src/app/config/runtime-config.ts), de modo que no haya
// que reconstruir la app al cambiar de backend.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
};
