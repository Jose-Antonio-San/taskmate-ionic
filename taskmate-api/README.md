# TaskMate API (Express + Node.js)

Backend REST para TaskMate. Node.js + Express es el stack más habitual con Ionic porque ambos usan JavaScript.

## Crear el proyecto (desde la raíz del repo)

```bash
mkdir taskmate-api && cd taskmate-api
npm init -y
npm install express cors mysql2 dotenv
npm install -D nodemon
```

Este repo ya incluye la carpeta y dependencias; los comandos sirven para reproducirlo desde cero.

## Configuración

1. **Archivo `.env`**: no viene en Git (está en `.gitignore` por seguridad). Cópialo desde la plantilla:
   - En la carpeta `taskmate-api`: copia `.env.example` y renombra la copia a **`.env`** (sin `example`), o en PowerShell: `Copy-Item .env.example .env`
   - En el explorador de Cursor/VS Code, activa “mostrar archivos ocultos” si no ves `.env` (empieza por punto).
2. Ajusta en **`.env`** los mismos datos que en Workbench: `DB_HOST`, `DB_PORT`, `DB_USER`, **`DB_PASSWORD`** (la que usas al conectar; si Workbench guarda contraseña, ponla aquí igual).
3. **`PORT`**: puerto HTTP de la API (por defecto **3000**). No lo confundas con **3306** (MySQL → `DB_PORT` en `.env`).

## Arrancar

```bash
# Producción / simple
node server.js

# Desarrollo (reinicio al guardar)
npm run dev
# equivalente al curso:
npx nodemon server.js
```

Prueba en el navegador o Postman: `GET http://localhost:3000/health` → debe responder `{ "status": "ok", "timestamp": "..." }`.

## Paso 2 — Conexión MySQL (Express ↔ base de datos)

En este repo **ya está hecho**:

| Requisito típico | Dónde está |
|------------------|------------|
| Dependencia `mysql2` | `package.json` |
| Pool de conexión y variables `DB_*` | `src/db.js` + `.env` |
| Cargar variables de entorno | `require('dotenv').config()` al inicio de `server.js` |
| Usar la BD en rutas | `src/routes/tasks.js` (consultas con `pool.query`) |
| Script SQL base + tabla | `sql/schema.sql` |

**Comprobar el paso 2 en caliente:** con la API levantada, abre  
`GET http://localhost:3000/api/db-health`  
→ `200` y `{ "ok": true, ... }` si MySQL responde; `503` si falla usuario/contraseña o el servidor MySQL.

**Si en tu guía el “paso 2” es el front con HttpClient:** en la app Ionic ya está `provideHttpClient()` en `src/main.ts` y `TaskService` consume `${environment.apiUrl}/tasks` (no hace falta duplicar nada).

## Criterios de aceptación (T01)

| Criterio | Cómo comprobarlo |
|----------|------------------|
| Servidor en puerto 3000 (o configurable) | Variable `PORT` en `.env` |
| `GET /health` → `status: "ok"` | Abrir `/health` y ver JSON |
| CORS correcto | `CORS_ORIGIN` incluye el origen de Ionic (`http://localhost:8100` por defecto) |
| Sin errores graves al arrancar | Consola sin fallos de Node; si MySQL no está listo, ver aviso suave (no bloquea `/health`) |

## Si el servidor no arranca: puerto 3000 ocupado

**macOS / Linux**

```bash
lsof -i :3000
```

**Windows**

```bash
netstat -ano | findstr :3000
```

Cierra el proceso que use el puerto o cambia `PORT` en `.env` (y la URL en Ionic si cambias de puerto).

## Error típico de junior — evítalo

**Sin CORS**, el navegador bloquea las peticiones desde Ionic (origen distinto → error en consola del front). Este proyecto ya usa `cors` con `CORS_ORIGIN` para permitir el origen del `ng serve`.

## Base de datos (tareas)

Si vas a usar `GET/POST /api/tasks`, crea la base y la tabla con `sql/schema.sql` y revisa en `.env`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
