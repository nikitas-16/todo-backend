import pool from '../../config/db.js';

/**
 * Creates a new todo in the database.
 * @param {object} data - { title, description }
 * @returns {object} The created todo row.
 */
const createTodo = async ({ title, description }) => {
  const { rows } = await pool.query(
    `INSERT INTO todos (title, description)
     VALUES ($1, $2)
     RETURNING *`,
    [title, description || null]
  );
  return rows[0];
};

/**
 * Retrieves all todos, ordered by creation date (newest first).
 * Supports optional pagination via limit/offset.
 * @param {object} options - { limit, offset }
 * @returns {object[]} Array of todo rows.
 */
const getAllTodos = async ({ limit, offset } = {}) => {
  let query = 'SELECT * FROM todos ORDER BY created_at DESC';
  const params = [];

  if (limit !== undefined) {
    params.push(limit);
    query += ` LIMIT $${params.length}`;
  }
  if (offset !== undefined) {
    params.push(offset);
    query += ` OFFSET $${params.length}`;
  }

  const { rows } = await pool.query(query, params);
  return rows;
};

/**
 * Retrieves a single todo by its UUID.
 * @param {string} id - The todo UUID.
 * @returns {object|null} The todo row or null if not found.
 */
const getTodoById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
  return rows[0] || null;
};

/**
 * Partially updates a todo by its UUID.
 * Only the provided fields (title, description, is_completed) are updated.
 * @param {string} id - The todo UUID.
 * @param {object} data - Fields to update.
 * @returns {object|null} The updated todo row or null if not found.
 */
const updateTodo = async (id, data) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.is_completed !== undefined) {
    fields.push(`is_completed = $${paramIndex++}`);
    values.push(data.is_completed);
  }

  if (fields.length === 0) {
    return getTodoById(id);
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE todos SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return rows[0] || null;
};

/**
 * Deletes a todo by its UUID.
 * @param {string} id - The todo UUID.
 * @returns {boolean} True if a row was deleted, false otherwise.
 */
const deleteTodo = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM todos WHERE id = $1', [
    id,
  ]);
  return rowCount > 0;
};

export default {
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
};
