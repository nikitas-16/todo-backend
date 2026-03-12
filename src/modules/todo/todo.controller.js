import todoService from './todo.service.js';

/**
 * POST /todos
 * Creates a new todo item.
 */
const createTodo = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const todo = await todoService.createTodo({ title, description });
    return res.status(201).json(todo);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /todos
 * Returns all todo items. Supports optional ?limit and ?offset query params.
 */
const getAllTodos = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset, 10)
      : undefined;
    const todos = await todoService.getAllTodos({ limit, offset });
    return res.status(200).json(todos);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /todos/:id
 * Returns a single todo by UUID.
 */
const getTodoById = async (req, res, next) => {
  try {
    const todo = await todoService.getTodoById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    return res.status(200).json(todo);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /todos/:id
 * Partially updates a todo (title, description, or is_completed).
 */
const updateTodo = async (req, res, next) => {
  try {
    const { title, description, is_completed } = req.body;
    const todo = await todoService.updateTodo(req.params.id, {
      title,
      description,
      is_completed,
    });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    return res.status(200).json(todo);
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /todos/:id
 * Removes a todo by UUID.
 */
const deleteTodo = async (req, res, next) => {
  try {
    const deleted = await todoService.deleteTodo(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export default {
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
};
