# StudyFinder

**StudyFinder** es una aplicación web para estudiantes que reúne, en un solo lugar, la
organización del estudio: materias, tareas, calendario, biblioteca de documentos,
estadísticas y mensajería entre usuarios.

El proyecto tiene dos partes independientes que se ejecutan a la vez:

- **Backend** (`backend/`): API REST hecha con **FastAPI** (Python). Guarda los usuarios y
  los documentos en **MongoDB**. Escucha en `http://localhost:8000`.
- **Frontend** (`front/studyfinderFront/`): aplicación web hecha con **Angular 22**.
  Es lo que ve el usuario en el navegador. Escucha en `http://localhost:4200`.

> El frontend **no funciona sin el backend**. Hay que tener los dos encendidos al mismo tiempo.

---

## Índice

1. [Qué puedes hacer en la aplicación](#qué-puedes-hacer-en-la-aplicación)
2. [Requisitos previos](#requisitos-previos)
3. [Descargar el proyecto](#descargar-el-proyecto)
4. [Poner en marcha el backend](#paso-1-poner-en-marcha-el-backend)
5. [Poner en marcha el frontend](#paso-2-poner-en-marcha-el-frontend)
6. [Cómo usar la aplicación](#cómo-usar-la-aplicación)
7. [Ejecutar las pruebas (tests)](#ejecutar-las-pruebas-tests)
8. [Compilar para producción](#compilar-para-producción)
9. [Problemas frecuentes](#problemas-frecuentes)
10. [Estructura del repositorio](#estructura-del-repositorio)

---

## Qué puedes hacer en la aplicación

- **Registrarte e iniciar sesión** con nombre, correo y contraseña.
- **Materias**: ver las materias del semestre y activar las que curses.
- **Biblioteca**: subir tus documentos (PDF, Word, PowerPoint, Excel), verlos y
  descargarlos. Los documentos se comparten entre usuarios de la plataforma.
- **Tareas**: crear tareas, marcar prioridad, fecha límite y adjuntar documentos de tu
  biblioteca. Se organizan solas en columnas (Hoy, Pendientes, Completadas).
- **Calendario**: ver tus tareas y eventos por día.
- **Mensajería**: buscar a otros usuarios **por su nombre**, agregarlos como contactos y
  chatear con ellos (texto y archivos de hasta 3 MB).
- **Estadísticas**: resumen de tu actividad de estudio.

---

## Requisitos previos

Antes de empezar necesitas instalar estas herramientas en tu computador:

| Herramienta | Versión recomendada | Para qué sirve | Cómo comprobar que la tienes |
|---|---|---|---|
| **Python** | 3.10 o superior | Ejecutar el backend | `python --version` |
| **Node.js** | 20.19+, 22.12+ o 24+ | Ejecutar el frontend | `node --version` |
| **npm** | Incluido con Node.js | Instalar librerías del frontend | `npm --version` |
| **Git** | Cualquiera reciente | Descargar el proyecto | `git --version` |

También necesitas una **base de datos MongoDB**. Lo más fácil es usar **MongoDB Atlas**
(gratis, en la nube):

1. Crea una cuenta en <https://www.mongodb.com/atlas>.
2. Crea un clúster gratuito (opción *M0 / Free*).
3. En *Database Access* crea un usuario de base de datos con su contraseña.
4. En *Network Access* permite el acceso desde tu IP (o `0.0.0.0/0` para pruebas).
5. En *Connect → Drivers* copia la cadena de conexión (empieza por `mongodb+srv://...`).
   La usarás en el [Paso 1](#paso-1-poner-en-marcha-el-backend).

> Si ya tienes MongoDB instalado en tu computador, también vale: usa la cadena
> `mongodb://localhost:27017`.

---

## Descargar el proyecto

Abre una terminal (en Windows puede ser **PowerShell**) y ejecuta:

```bash
git clone https://github.com/alejandromediatecnica-cpu/StudyFinder.git
cd StudyFinder
```

A partir de aquí, **cada comando se ejecuta dentro de su carpeta**. No hay un `package.json`
ni un comando único en la raíz.

---

## Paso 1: Poner en marcha el backend

Todos los comandos de esta sección se ejecutan **dentro de la carpeta `backend/`**.

```bash
cd backend
```

### 1.1 Crear un entorno virtual (recomendado)

Aísla las librerías del proyecto para no ensuciar tu Python global.

**Windows (PowerShell):**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

> Sabrás que funcionó porque aparece `(.venv)` al inicio de la línea de la terminal.
> Si PowerShell no deja activarlo, ejecuta primero:
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

### 1.2 Instalar las dependencias

```bash
pip install -r requirements.txt
```

Esto instala FastAPI, Uvicorn, PyMongo, etc.

### 1.3 Configurar la conexión a la base de datos

Crea un archivo `.env` copiando el ejemplo y edítalo con tus datos:

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Abre `backend/.env` con un editor y reemplaza el usuario, la contraseña y el nombre del
clúster por los de tu base de datos:

```
MONGODB_URL=mongodb+srv://TU_USUARIO:TU_PASSWORD@tu-cluster.mongodb.net/?appName=StudentHub1
MONGODB_DATABASE=studyfinder
```

- `MONGODB_URL`: la cadena de conexión que copiaste de Atlas.
- `MONGODB_DATABASE`: el nombre de la base de datos (déjalo como `studyfinder`).

> El archivo `.env` **no se sube a Git** (está en `.gitignore`), así que tus credenciales
> quedan solo en tu computador.

### 1.4 Arrancar el servidor

```bash
python -m uvicorn app.main:app --port 8000
```

Si va bien verás algo así:

```
Uvicorn running on http://127.0.0.1:8000
Application startup complete.
```

Comprueba abriendo en el navegador:

- <http://localhost:8000> → debe responder
  `{"message":"Backend de StudyFinder operando correctamente"}`
- <http://localhost:8000/docs> → documentación interactiva de la API (Swagger).

Deja esta terminal abierta. **No la cierres.**

---

## Paso 2: Poner en marcha el frontend

Abre **una segunda terminal** (deja el backend corriendo en la primera) y ve a la carpeta
del frontend:

```bash
cd front/studyfinderFront
```

### 2.1 Instalar las dependencias

```bash
npm install
```

La primera vez tarda unos minutos.

### 1.5 (Frontend) Arrancar el servidor de desarrollo

```bash
npm start
```

Cuando termine de compilar, abre tu navegador en:

**<http://localhost:4200>**

Ya puedes registrarte y usar la aplicación.

---

## Cómo usar la aplicación

1. **Regístrate**: en la página de inicio pulsa *Crear cuenta* e ingresa tu nombre, correo y
   una contraseña. También puedes iniciar sesión si ya tienes cuenta.
2. **Elige tus materias**: entra a **Materias** y activa las que estás cursando.
3. **Sube tus documentos**: en **Biblioteca** sube archivos (PDF, DOC/DOCX, PPT/PPTX,
   XLS/XLSX). Cada usuario tiene **3 MB de almacenamiento**.
4. **Organiza tus tareas**: en **Tareas** crea tareas con prioridad, fecha límite y adjuntos.
5. **Revisa tu calendario**: en **Calendario** verás tus tareas por día.
6. **Chatea con otros estudiantes**: en **Mensajería**, usa *+ Agregar*, escribe el
   **nombre** de la persona, elige el resultado y envíale una solicitud. Cuando la acepte,
   podrán chatear.

> **Importante**: los datos de tu sesión (usuario y token) se guardan en el navegador
> (`localStorage`). Si cierras sesión o borras los datos del navegador, tendrás que
> iniciar sesión de nuevo.

---

## Ejecutar las pruebas (tests)

El proyecto incluye pruebas automáticas. No son obligatorias para usar la aplicación, pero
sirven para comprobar que todo funciona.

### Backend

Las pruebas usan una base de datos en memoria (`mongomock`), así que **no necesitas MongoDB**
para ejecutarlas. Primero instala las dependencias de desarrollo:

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest
```

### Frontend

```bash
cd front/studyfinderFront
npm test
```

Para comprobar también que el proyecto compila correctamente:

```bash
npm run build
```

---

## Compilar para producción

Si quieres publicar la aplicación en un servidor:

```bash
cd front/studyfinderFront
npm run build
```

Esto genera la carpeta `dist/studyfinderFront/`. Para servirla:

```bash
npm run serve:ssr:studyfinderFront
```

El backend en producción se levanta igual que en desarrollo, pero sin el modo de
recarga y detrás de un servidor de producción (por ejemplo, Uvicorn con Gunicorn).

---

## Desplegar el backend en Render

El backend está listo para publicarse en [Render](https://render.com). Lee toda su
configuración (base de datos y CORS) desde **variables de entorno**, igual que en local
con el archivo `.env`, así que **ninguna credencial queda en el código**.

### 1. Crear el servicio

En <https://dashboard.render.com/web/new> crea un **Web Service** conectado a este
repositorio y usa estos valores:

| Ajuste | Valor |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Runtime** | Python 3 |

> También puedes usar el archivo `render.yaml` de la raíz del repositorio: en Render elige
> *New → Blueprint* y selecciona el repo; los valores se rellenan solos.

### 2. Definir las variables de entorno

En el servicio, entra a **Environment → Environment Variables** y agrega exactamente las
mismas claves de `backend/.env.example`:

| Variable | Valor en Render | Secreta |
|---|---|---|
| `MONGODB_URL` | Tu cadena de conexión de MongoDB Atlas | Sí |
| `MONGODB_DATABASE` | `studyfinder` | No |
| `CORS_ORIGINS` | La URL pública de tu frontend, p. ej. `https://tu-front.onrender.com` | No |

`PORT` **no** hace falta definirlo: Render lo asigna automáticamente y el backend lo lee.

> Como el backend guarda las subidas en disco (`backend/uploads/`), en el plan gratuito de
> Render ese almacenamiento es efímero: los archivos pueden perderse al reiniciar el
> servicio. Para conservarlos, añade un *Persistent Disk* o migra los archivos a un
> servicio de almacenamiento.

---

## Problemas frecuentes

**«No se puede conectar a la API» / la app no carga datos**
- Asegúrate de que el **backend esté encendido** en `http://localhost:8000`.
- Revisa que el frontend esté en el **puerto 4200** exactamente. Los puertos están fijos en
  el código: cambiar uno obliga a cambiar el otro.

**«No conecta a MongoDB» (error al arrancar el backend)**
- Revisa que `backend/.env` exista y que `MONGODB_URL` sea correcta (usuario y contraseña
  bien escritos).
- En Atlas, comprueba que tu IP esté permitida en *Network Access*.

**`python` o `pip` no se reconocen**
- En Windows prueba con `py` en lugar de `python`.
- Verifica que Python quedó marcado como «Add to PATH» durante la instalación.

**`npm` no se reconoce**
- Instala Node.js desde <https://nodejs.org> y reinicia la terminal.

**El frontend muestra «Inicia sesión» pero ya inicié sesión**
- Los datos de sesión se guardan en el navegador. Cierra sesión y vuelve a entrar, o borra
  los datos del sitio e inténtalo de nuevo.

**PowerShell no me deja activar el entorno virtual**
- Ejecuta `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` y vuelve a intentarlo.

---

## Estructura del repositorio

```
StudyFinder/
├── backend/                     # API en FastAPI (Python)
│   ├── app/
│   │   ├── api/                 # Rutas: auth, documents, search, users, contacts, messages
│   │   ├── main.py              # Punto de entrada y configuración de CORS
│   │   ├── database.py          # Acceso a MongoDB
│   │   └── config.py            # Lee el archivo .env
│   ├── tests/                   # Pruebas (pytest + mongomock)
│   ├── scripts/                 # Migración de datos antiguos
│   ├── requirements.txt         # Dependencias
│   ├── requirements-dev.txt     # Dependencias para pruebas
│   └── .env.example             # Plantilla de configuración
│
├── front/studyfinderFront/      # Aplicación web en Angular 22
│   └── src/app/
│       ├── app/pages/           # Pantallas: landing, login, main, materias, tareas...
│       └── services/            # Conexión con el backend (auth, search, documents, messages...)
│
├── AGENTS.md                    # Notas técnicas para quien desarrolla el código
└── README.md                    # Este archivo
```

> La carpeta `front.zip` en la raíz es una copia antigua del frontend y **no se usa** para
> ejecutar la aplicación. Puedes ignorarla.
