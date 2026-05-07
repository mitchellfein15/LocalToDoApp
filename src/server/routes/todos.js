const express = require('express');
const router = express.Router();
const TodoController = require('../controllers/todoController');

// GET all todos
router.get('/', TodoController.getAllTodos);

// GET single todo by ID
router.get('/:id', TodoController.getTodoById);

// POST create new todo
router.post('/', TodoController.createTodo);

// PUT update todo
router.put('/:id', TodoController.updateTodo);

// PATCH mark todo completed
router.patch('/:id/complete', TodoController.completeTodo);

// DELETE todo
router.delete('/:id', TodoController.deleteTodo);


module.exports = router; 