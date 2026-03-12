import express from 'express';
import Joi from 'joi';
import todoController from './todo.controller.js';
import validate from '../../middleware/validate.js';
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

// Routes
router.post('/', validate(createTodoSchema), todoController.createTodo);
router.get('/', todoController.getAllTodos);
router.get('/:id', validateUUID, todoController.getTodoById);
router.patch(
  '/:id',
  validateUUID,
  validate(updateTodoSchema),
  todoController.updateTodo
);
router.delete('/:id', validateUUID, todoController.deleteTodo);

export default router;
