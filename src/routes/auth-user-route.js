const express = require('express')

const authUser = require('../controllers/auth-user-controllers')
const authenticateMiddleware = require('../middlwares/authenticate')

const router = express.Router()

router.post('/register', authUser.register)
router.post('/login', authUser.login)
// router.get('/me', authenticateMiddleware, authUser.getMe)
router.get('/me', authenticateMiddleware, authUser.getMe)

module.exports = router