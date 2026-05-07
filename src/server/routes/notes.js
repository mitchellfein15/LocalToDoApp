const express = require('express');
const router = express.Router();
const NotesController = require('../controllers/notesController');

router.get('/', NotesController.getAllNotes);
router.post('/', NotesController.createNote);
router.put('/:id', NotesController.updateNote);
router.delete('/:id', NotesController.deleteNote);

module.exports = router;
