# StudyFinder — Frontend

**StudyFinder** es una aplicación web para estudiantes que reúne la organización del
estudio: materias, tareas, calendario, biblioteca de documentos, estadísticas y mensajería
entre usuarios.

Este repositorio contiene el **frontend**, hecho con **Angular 22** (componentes standalone,
signals, SSR con prerender). Escucha en `http://localhost:4200`.

> El frontend **no funciona sin el backend** (repositorio `StudyFinder-backend`, FastAPI en
> `http://localhost:8000`). Hay que tener los dos encendidos al mismo tiempo; consulta el
> README del backend para levantarlo.

---

## Qué puedes hacer en la aplicación

- **Registrarte e iniciar sesión** con nombre, correo y contraseña.
- **Materias**: ver las materias del semestre y activar las que curses.
- **Biblioteca**: subir documentos (PDF, Word, PowerPoint, Excel), verlos y descargarlos.
  Los documentos se comparten entre usuarios.
- **Tareas**: crear tareas con prioridad, fecha límite y documentos adjuntos.
- **Calendario**: ver tus tareas y eventos por día.
- **Mensajería**: buscar usuarios **por nombre**, agregarlos como contactos y chatear
  (texto y archivos de hasta 3 MB).
- **Estadísticas**: resumen de tu actividad de estudio.

---

## Requisitos previos

| Herramienta | Versión | Comprobar |
| --- | --- | --- |
| **Node.js** | 20.19+, 22.12+ o 24+ | `node --version` |
| **npm** | Incluido con Node.js | `npm --version` |
| **Backend StudyFinder** | En marcha en `http://localhost:8000` | Abrir <http://localhost:8000> |

---

## Puesta en marcha

Todos los comandos se ejecutan **en la raíz de este repositorio**.

### 1. Instalar dependencias

```bash
npm ci
```

Instala exactamente las versiones de `package-lock.json`. La primera vez tarda unos minutos.

### 2. Configurar variables de entorno

Copia la plantilla (los valores por defecto sirven para desarrollo local):

```powershell
Copy-Item .env.example .env      # Windows (PowerShell)
```

```bash
cp .env.example .env             # macOS / Linux
```

| Variable | Cuándo se usa | Descripción | Valor por defecto |
| --- | --- | --- | --- |
| `API_URL` | Compilación | URL base del backend, sin barra final. El origen del frontend debe estar en `CORS_ORIGINS` del backend. | `http://localhost:8000` |
| `NG_ALLOWED_HOSTS` | Ejecución SSR | Hosts a los que responde el servidor SSR, separados por comas (admite `*.dominio.com`). Cualquier otro `Host` recibe **400** (protección SSRF). **Obligatoria** en producción con el dominio real. | — (sin valor, todo host recibe 400) |
| `PORT` | Ejecución SSR | Puerto de `npm run serve:ssr:studyfinderFront`. | `4000` |

Cómo funciona:

- **Compilación**: `npm start`, `npm run build`, `npm run watch` y `npm test` ejecutan antes
  `scripts/generate-env.mjs`, que lee `.env` y genera `src/environments/environment.ts`
  (ignorado por Git). Si cambias `.env`, reinicia `npm start`. Estas variables acaban en el
  JavaScript que descarga el navegador: son **públicas**, nunca pongas secretos.
- **Ejecución SSR**: `src/server.ts` carga `.env` al arrancar. `NG_ALLOWED_HOSTS` es la
  variable nativa de Angular SSR.
- En ambos casos las variables del sistema, como las del panel de Vercel, tienen prioridad
  sobre `.env`.

### 3. Arrancar el servidor de desarrollo

```bash
npm start
```

Abre <http://localhost:4200>. La página se recarga sola al guardar cambios.

---

## Pruebas

```bash
npm test            # pruebas unitarias (Vitest + jsdom)
npm run build       # comprueba tipos, compila AOT y prerenderiza las rutas
```

Para ejecutar solo un archivo de pruebas:

```bash
npx ng test --include "src/app/app/pages/login/login.spec.ts"
```

> Los avisos de presupuesto `anyComponentStyle` (CSS de componente > 4 kB) son esperados y
> no detienen la compilación.

---

## Compilar para producción

```bash
npm run build
```

Genera `dist/studyfinderFront/` (`browser/` estático + `server/` para SSR). Para servirlo
con Node:

```bash
npm run serve:ssr:studyfinderFront      # escucha en PORT (por defecto 4000)
```

> El servidor SSR solo responde a los hosts de `NG_ALLOWED_HOSTS`. Para desplegar en un
> dominio real, añádelo a esa variable en el hosting (p. ej. `NG_ALLOWED_HOSTS=studyfinder.app`)
> y define `API_URL` con la URL pública del backend **antes** de compilar.

---

## Cómo usar la aplicación

1. **Regístrate**: en la página de inicio pulsa *Crear cuenta*, o inicia sesión si ya
   tienes cuenta.
2. **Elige tus materias** en **Materias**.
3. **Sube documentos** en **Biblioteca** (PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX). Cada usuario
   dispone de **3 MB**.
4. **Organiza tus tareas** en **Tareas**; las que tienen fecha aparecen en **Calendario**.
5. **Chatea**: en **Mensajería** usa *+ Agregar*, busca a la persona por su nombre y envíale
   una solicitud. Cuando la acepte, podréis chatear.

> La sesión (usuario y token) se guarda en el navegador (`localStorage`). Las tareas, el
> calendario, las materias y las estadísticas también se guardan solo en el navegador.

---

## Estructura

```text
StudyFinder-Frontend/
├── src/
│   ├── app/
│   │   ├── app/pages/        # Pantallas: landing, login, signup, main, materias, tareas...
│   │   ├── app/components/   # Componentes reutilizables (date-picker, styled-select)
│   │   ├── services/         # Comunicación con el backend y estado local
│   │   ├── utils/            # Utilidades (mensajes de error del backend)
│   │   ├── app.routes.ts     # Rutas y guards de autenticación
│   │   └── app.config.ts     # Providers de la aplicación
│   ├── environments/         # environment.ts generado desde .env (no se versiona)
│   ├── server.ts             # Servidor Express para SSR
│   └── styles.css            # Tokens de diseño globales
├── public/                   # Recursos estáticos (favicon, fondo)
├── scripts/generate-env.mjs  # Genera environment.ts a partir de .env
├── .env.example              # Plantilla de variables de entorno
├── angular.json
├── package.json
└── AGENTS.md                 # Notas técnicas para desarrollo
```

---

## Problemas frecuentes

**La app no carga datos / «No se puede conectar a la API»:**

- Comprueba que el backend esté encendido en `http://localhost:8000`.
- Comprueba que `API_URL` en `.env` apunte al backend y reinicia `npm start`.
- Si la consola del navegador muestra un error de CORS, añade la URL del frontend a
  `CORS_ORIGINS` en el `.env` del backend.

**Error al importar `environments/environment`** — el archivo se genera al ejecutar
`npm start`/`npm run build`/`npm test`; si usas `ng` directamente, ejecuta antes `npm run env`.

**`npm` no se reconoce** — instala Node.js desde <https://nodejs.org> y reinicia la terminal.

**Aparece «Inicia sesión» aunque ya iniciaste sesión** — cierra sesión y vuelve a entrar,
o borra los datos del sitio en el navegador.
