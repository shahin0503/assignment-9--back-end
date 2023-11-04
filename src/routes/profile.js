const express = require('express')
const admin = require('../firebase')
const router = new express.Router()

const db = admin.firestore()

router.post('/profile',async (req, res) => {
    try{
        const {userName, userRole, userEmail, uid} = req.body
        const userData = {userName, userRole, userEmail, uid}
        const userResponse = await db.collection('users').add(userData)
        res.send(userResponse)
    }catch(error){
        res.send(error)
    }
})

module.exports = router