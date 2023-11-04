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

        const updatedTaskData = {
            taskName: taskName || existingTask.data().taskName,
            assignedUsers: assignedUsers || existingTask.data().assignedUsers
        };

        await taskRef.update(updatedTaskData);

        res.status(200).json({ message: 'Task updated successfully!' });   
       } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router