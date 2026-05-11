const express = require('express');
const pool = require('../db');

const router = express.Router();

const ALLOWED_PRIORITY = new Set(['Alta', 'Media', 'Baja']);

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    completed: Boolean(row.completed),
    category: row.category,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
  };
}

function jsonSuccess(res, statusCode, data) {
  res.status(statusCode).json({ success: true, data });
}

function jsonError(res, statusCode, message) {
  res.status(statusCode).json({ success: false, message });
}

function parseId(param) {
  const id = parseInt(param, 10);
  return Number.isNaN(id) ? null : id;
}

/** Validación para POST y PUT (cuerpo completo). */
function validateCreateOrReplaceBody(body) {
  const errors = [];
  const b = body ?? {};

  if (typeof b.title !== 'string' || b.title.trim().length < 3) {
    errors.push('El título es obligatorio (mínimo 3 caracteres)');
  }

  const priority = b.priority !== undefined ? b.priority : 'Media';
  if (!ALLOWED_PRIORITY.has(priority)) {
    errors.push('Prioridad inválida (Alta, Media o Baja)');
  }

  if (b.completed !== undefined && typeof b.completed !== 'boolean') {
    errors.push('completed debe ser booleano');
  }

  if (errors.length) {
    return { ok: false, errors };
  }

  const title = b.title.trim();
  const desc =
    b.description === undefined
      ? null
      : typeof b.description === 'string' && b.description.trim() !== ''
        ? b.description.trim()
        : null;
  const cat =
    b.category === undefined
      ? null
      : typeof b.category === 'string' && b.category.trim() !== ''
        ? b.category.trim()
        : null;

  return {
    ok: true,
    title,
    description: desc,
    priority,
    category: cat,
    completed: Boolean(b.completed),
  };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, priority, completed, category, created_at FROM tasks ORDER BY created_at DESC'
    );
    jsonSuccess(res, 200, rows.map(mapRow));
  } catch (err) {
    console.error(err);
    jsonError(res, 500, 'Error al listar tareas');
  }
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    jsonError(res, 400, 'ID inválido');
    return;
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, priority, completed, category, created_at FROM tasks WHERE id = ?',
      [id]
    );
    if (!rows.length) {
      jsonError(res, 404, 'Tarea no encontrada');
      return;
    }
    jsonSuccess(res, 200, mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    jsonError(res, 500, 'Error al obtener la tarea');
  }
});

router.post('/', async (req, res) => {
  const v = validateCreateOrReplaceBody(req.body);
  if (!v.ok) {
    jsonError(res, 400, v.errors.join('; '));
    return;
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, priority, completed, category)
       VALUES (?, ?, ?, ?, ?)`,
      [v.title, v.description, v.priority, v.completed ? 1 : 0, v.category]
    );
    const newId = result.insertId;
    const [rows] = await pool.query(
      'SELECT id, title, description, priority, completed, category, created_at FROM tasks WHERE id = ?',
      [newId]
    );
    jsonSuccess(res, 201, mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    jsonError(res, 500, 'Error al crear la tarea');
  }
});

/** Actualización completa (CRUD del curso). */
router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    jsonError(res, 400, 'ID inválido');
    return;
  }

  const v = validateCreateOrReplaceBody(req.body);
  if (!v.ok) {
    jsonError(res, 400, v.errors.join('; '));
    return;
  }

  try {
    const [result] = await pool.query(
      `UPDATE tasks SET title = ?, description = ?, priority = ?, completed = ?, category = ? WHERE id = ?`,
      [v.title, v.description, v.priority, v.completed ? 1 : 0, v.category, id]
    );
    if (!result.affectedRows) {
      jsonError(res, 404, 'Tarea no encontrada');
      return;
    }
    const [rows] = await pool.query(
      'SELECT id, title, description, priority, completed, category, created_at FROM tasks WHERE id = ?',
      [id]
    );
    jsonSuccess(res, 200, mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    jsonError(res, 500, 'Error al actualizar la tarea');
  }
});

/** Actualización parcial (compatibilidad con el cliente Ionic). */
router.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    jsonError(res, 400, 'ID inválido');
    return;
  }

  const updates = [];
  const values = [];

  if (typeof req.body?.title === 'string') {
    const t = req.body.title.trim();
    if (t.length < 3) {
      jsonError(res, 400, 'El título debe tener al menos 3 caracteres');
      return;
    }
    updates.push('title = ?');
    values.push(t);
  }
  if (typeof req.body?.description === 'string') {
    updates.push('description = ?');
    values.push(req.body.description.trim() === '' ? null : req.body.description.trim());
  }
  if (req.body?.priority !== undefined) {
    if (!ALLOWED_PRIORITY.has(req.body.priority)) {
      jsonError(res, 400, 'Prioridad inválida');
      return;
    }
    updates.push('priority = ?');
    values.push(req.body.priority);
  }
  if (typeof req.body?.category === 'string') {
    updates.push('category = ?');
    values.push(req.body.category.trim() === '' ? null : req.body.category.trim());
  }
  if (typeof req.body?.completed === 'boolean') {
    updates.push('completed = ?');
    values.push(req.body.completed ? 1 : 0);
  }

  if (!updates.length) {
    jsonError(res, 400, 'No hay campos para actualizar');
    return;
  }

  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    if (!result.affectedRows) {
      jsonError(res, 404, 'Tarea no encontrada');
      return;
    }
    const [rows] = await pool.query(
      'SELECT id, title, description, priority, completed, category, created_at FROM tasks WHERE id = ?',
      [id]
    );
    jsonSuccess(res, 200, mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    jsonError(res, 500, 'Error al actualizar la tarea');
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    jsonError(res, 400, 'ID inválido');
    return;
  }
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (!result.affectedRows) {
      jsonError(res, 404, 'Tarea no encontrada');
      return;
    }
    jsonSuccess(res, 200, { id, deleted: true });
  } catch (err) {
    console.error(err);
    jsonError(res, 500, 'Error al eliminar la tarea');
  }
});

module.exports = router;
