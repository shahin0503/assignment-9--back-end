const express = require('express')
const admin = require('../firebase')
const { async } = require('@firebase/util')
const router = new express.Router()

const db = admin.firestore()

router.post('/signup', async (req, res) => {
    try {
        const { email, password, userName } = req.body

        const userRecord = await admin.auth().createUser({ email: email, password: password });
        const userData = {
            email: email, userName: userName, uid: userRecord.uid
        }
        await db.collection('users').doc(userRecord.uid).set(userData);

        res.status(201).json({ message: 'User created successfully!', userRecord });
    } catch (error) {
        console.log(error)
        if (error.code === 'auth/email-already-exists') {
            res.status(400).json({ error: 'Email address is already in use.' });
        } else if (error.code === 'auth/invalid-email') {
            res.status(401).json({ error: 'Invalid email address.' });
        } else if (error.code === 'auth/invalid-password') {
            res.status(402).json({ error: 'Password is too weak.' });
        } else {
            res.status(500).json({ error: 'Error creating user' });
        }
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const userData = {
            email: email,
            password: password
        }
        const userResponse = await admin.auth().getUserByEmail(userData.email);
        
        res.json(userResponse)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

router.get('/users', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get()
        const users = []
        usersSnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                data: doc.data()
            });
        });
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
})

module.exports = router