import express from 'express';
import Joi from 'joi';
import todoController from './todo.controller.js';
import validate, { validateQuery } from '../../middleware/validate.js';
import validateUUID from '../../middleware/validateUUID.js';

const router = express.Router();

// Validation schemas
const createTodoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Title must not be empty',
    'any.required': 'Title is required',
  }),
  description: Joi.string().allow(null, '').optional(),
});

const updateTodoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).optional().messages({
    'string.empty': 'Title must not be empty',
  }),
  description: Joi.string().allow(null, '').optional(),
  is_completed: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

const getTodosQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional().messages({
    'number.base': 'limit must be a valid number',
    'number.integer': 'limit must be an integer',
    'number.min': 'limit must be at least 1',
  }),
  offset: Joi.number().integer().min(0).optional().messages({
    'number.base': 'offset must be a valid number',
    'number.integer': 'offset must be an integer',
    'number.min': 'offset must be at least 0',
  }),
});

// Routes
router.post('/', validate(createTodoSchema), todoController.createTodo);
router.get('/', validateQuery(getTodosQuerySchema), todoController.getAllTodos);
router.get('/:id', validateUUID, todoController.getTodoById);
router.patch(
  '/:id',
  validateUUID,
  validate(updateTodoSchema),
  todoController.updateTodo
);
router.delete('/:id', validateUUID, todoController.deleteTodo);

export default router;
