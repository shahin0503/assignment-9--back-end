const express = require('express')
const admin = require('../firebase')
const router = new express.Router()

const db = admin.firestore()

router.post('/task', async (req, res) => {
  try {
    const { taskName, assignedUsers, creator } = req.body

    const tasksRef = db.collection('tasks');

    const taskData = {
      taskName,
      assignedUsers,
      creator,
    };

    const newTaskRef = await tasksRef.add(taskData);

    await newTaskRef.update({
      taskId: newTaskRef.id
    });

    res.status(200).json({ message: 'Task assigned successfully!', taskId: newTaskRef.id });

  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

router.get('/task/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    const snapshot = await db.collection('tasks')
      .where(`assignedUsers.${uid}`, '>=', false)
      .get();

    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push(doc.data());
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/task/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { taskName, assignedUsers } = req.body;

    const taskRef = db.collection('tasks').doc(taskId);

    const existingTask = await taskRef.get();

    if (!existingTask.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedAssignedUsers = {
      ...existingTask.data().assignedUsers,
      ...assignedUsers
    };

    const updatedTaskData = {
      taskName: taskName || existingTask.data().taskName,
      assignedUsers: updatedAssignedUsers
    };

    await taskRef.update(updatedTaskData);

    res.status(200).json({ message: 'Task updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/task/:taskId', async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const taskRef = db.collection('tasks').doc(taskId);

    const existingTask = await taskRef.get();

    if (!existingTask.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await taskRef.delete()

    res.status(200).json({ message: 'Task deleted successfully!' });
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

router.get('/tasks/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    const snapshot = await db.collection('tasks')
      .where(`creator`, '==', uid)
      .get();

    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push(doc.data());
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router