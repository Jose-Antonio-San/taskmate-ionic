require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./src/db');
const tasksRouter = require('./src/routes/tasks');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Ionic suele usar 8100; `ng serve` usa 4200. Lista separada por comas en CORS_ORIGIN del .env
const corsOrigin =
  process.env.CORS_ORIGIN || 'http://localhost:8100,http://localhost:4200';
const allowedOrigins = corsOrigin.split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

/** Raíz: evita "Ruta no encontrada" si abres solo http://localhost:3000 */
app.get('/', (req, res) => {
  res.json({
    service: 'taskmate-api',
    endpoints: {
      health: `${req.protocol}://${req.get('host')}/health`,
      dbHealth: `${req.protocol}://${req.get('host')}/api/db-health`,
      tasks: `${req.protocol}://${req.get('host')}/tasks`,
      tasksApiPrefix: `${req.protocol}://${req.get('host')}/api/tasks`,
    },
    hint: 'La app Ionic/Angular va en otro puerto (8100 o 4200); esta API es el 3000.',
  });
});

/** Ruta de prueba (criterio de aceptación del sprint). */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

/** Paso 2 sprint: comprobar conexión MySQL (Postman / navegador). */
app.get('/api/db-health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      ok: true,
      database: process.env.DB_NAME || 'taskmate',
      message: 'MySQL accesible desde Express',
    });
  } catch (e) {
    res.status(503).json({
      ok: false,
      message: 'No se pudo conectar a MySQL',
      code: e.code || undefined,
    });
  }
});

app.use('/api/tasks', tasksRouter);
/** Alias del curso: GET/POST http://localhost:3000/tasks (mismo router que /api/tasks) */
app.use('/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

/** Manejo de errores global */
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

const server = app.listen(PORT, async () => {
  console.log(`TaskMate API en http://localhost:${PORT}`);
  console.log(`CORS permitidos: ${allowedOrigins.join(', ')}`);
  try {
    await pool.query('SELECT 1');
    console.log('MySQL: conexión OK (rutas /api/tasks listas).');
  } catch (e) {
    // No usar console.error aquí: el sprint pide arranque limpio; /health sigue funcionando sin MySQL.
    console.warn(
      '[taskmate-api] MySQL no disponible; /api/tasks fallará hasta configurar .env y sql/schema.sql.',
      e.code || e.message
    );
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[!] El puerto ${PORT} ya está en uso (EADDRINUSE).\n` +
        `    Cierra la otra terminal (Ctrl+C), o cambia PORT en .env (ej. PORT=3001).\n` +
        `    No ejecutes a la vez: node server.js y otro servidor en el mismo puerto.\n`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
