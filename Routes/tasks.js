const express = require('express');
const task = require('../Database/schema');
const userauth = require('../Middleware/token_auth');
const storage = require('../Config/cloudinary');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const upload = multer({ storage: storage });
const router = express.Router();

router.get('/', userauth, async (req, res) => {
  try {
    const allTask = await task.find({ user: req.user.id });
    res.status(200).json(allTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/completed', userauth, async (req, res) => {
  try {
    const completedTasks = await task.find({ user: req.user.id, Completed: true });
    res.status(200).json(completedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/incompleted', userauth, async (req, res) => {
  try {
    const incompleteTasks = await task.find({ user: req.user.id, Completed: { $ne: true } });
    res.status(200).json(incompleteTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', userauth, upload.single('attachment'), async (req, res) => {
  try {
    let existingTask = await task.findOne({ taskid: req.params.id, user: req.user.id });
    if (!existingTask) return res.status(404).send("Task not found");

    let updateData = {};

    if (req.body.isCompleted !== undefined) {
      updateData.Completed = req.body.isCompleted === true || req.body.isCompleted === 'true';
    }
    
    if (req.body.taskname) updateData.taskname = req.body.taskname;
    if (req.body.Description) updateData.Description = req.body.Description;

    if (req.file) {
      if (existingTask.filePublicId) {
        await cloudinary.uploader.destroy(existingTask.filePublicId);
      }
      updateData.fileUrl = req.file.path;
      updateData.filePublicId = req.file.filename;
    }

    const uptask = await task.findOneAndUpdate(
      { taskid: req.params.id, user: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Task updated successfully", uptask });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/', userauth, (req, res, next) => {
  upload.single('attachment')(req, res, function (err) {
    if (err) {
      console.error("Multer/Cloudinary Error:", err.message);
      return res.status(400).json({ message: `File upload initialization failed: ${err.message}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    const highestTask = await task.findOne({ user: req.user.id }).sort({ taskid: -1 });
    const nextId = highestTask && highestTask.taskid ? highestTask.taskid + 1 : 1;

    let fileUrl = null;
    let filePublicId = null;

    if (req.file) {
      fileUrl = req.file.path || req.file.url || null;
      filePublicId = req.file.filename || req.file.public_id || null;
    }

    const taskdata = { 
        taskname: req.body.taskname,
        Description: req.body.Description,
        taskid: nextId,
        user: req.user.id,
        fileUrl: fileUrl,
        filePublicId: filePublicId,
        isCompleted: false
    };

    const newtask = await task.create(taskdata);
    res.status(201).json(newtask);
  } catch (error) {
    console.error("Backend Task Creation Failure:", error.message);
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', userauth, upload.single('attachment'), async (req, res) => {
  try {
    let existingTask = await task.findOne({ taskid: req.params.id, user: req.user.id });
    if (!existingTask) return res.status(404).send("Task not found");

    let updateData = { ...req.body };

    if (req.file) {
      if (existingTask.filePublicId) {
        await cloudinary.uploader.destroy(existingTask.filePublicId);
      }
      updateData.fileUrl = req.file.path;
      updateData.filePublicId = req.file.filename;
    }

    const uptask = await task.findOneAndUpdate(
      { taskid: req.params.id, user: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Task updated successfully", uptask });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', userauth, async (req, res) => {
  try {
    const targetTask = await task.findOne({ taskid: req.params.id, user: req.user.id });
    if (!targetTask) return res.status(404).send("Task not found");

    if (targetTask.filePublicId) {
      await cloudinary.uploader.destroy(targetTask.filePublicId);
    }

    const deltask = await task.findOneAndDelete({ taskid: req.params.id, user: req.user.id });
    res.status(200).json({ message: "Task deleted successfully", deltask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;