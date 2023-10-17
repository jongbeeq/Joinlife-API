require('dotenv').config()
const express = require('express')
const cors = require('cors');
const morgan = require('morgan');

const rateLimitMiddleware = require('./middlwares/rate-limit');
const notFoundMiddleWare = require('./middlwares/not-found')
const errorMiddleware = require('./middlwares/error');
const authUserRoute = require('./routes/auth-user-route')
const categoryRoute = require('./routes/category-route')
const userRoute = require('./routes/user-route')
const eventRoute = require('./routes/event-route')
const postRoute = require('./routes/post-route')

const app = express()

app.use(cors());
app.use(morgan('dev'));
app.use(rateLimitMiddleware);
app.use(express.json())

app.use('/category', categoryRoute)
app.use('/auth', authUserRoute)
app.use('/event', eventRoute)
app.use('/post', postRoute)
app.use('/user', userRoute)

app.use(notFoundMiddleWare)
app.use(errorMiddleware);


const PORT = process.env.PORT || '5000'
app.listen(PORT, () => console.log(`server is run on port ${PORT}`))