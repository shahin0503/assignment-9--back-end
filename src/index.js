const express = require('express')
const cors = require('cors')
const userRouter = require('./routes/user')
const profileRouter = require('./routes/profile')
const taskRouter = require('./routes/task')

const app = express()

app.use(cors());

app.use(express.json())
app.use(userRouter)
app.use(profileRouter)
app.use(taskRouter)

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log('server is up on port ' + port)
}) 