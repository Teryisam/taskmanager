const express = require('express');
const { check, validationResult } = require('express-validator');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post(
  '/',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title } = req.body;

    try {
      const task = new Task({ title });
      await task.save();

      const io = req.app.get('io');
      io.emit('taskCreated', task);

      res.json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.patch(
  '/:id',
  [
    auth,
    check('title', 'Title is required').optional().not().isEmpty(),
    check('completed', 'Completed is required').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, completed } = req.body;

    try {
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({ msg: 'Task not found' });
      }

      if (title !== undefined) task.title = title;
      if (completed !== undefined) task.completed = completed;

      await task.save();

      const io = req.app.get('io');
      io.emit('taskUpdated', task);

      res.json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    await task.destroy();

    const io = req.app.get('io');
    io.emit('taskDeleted', { id });

    res.json({ msg: 'Task deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;