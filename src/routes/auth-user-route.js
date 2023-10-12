const express = require('express')

const authUser = require('../controllers/auth-user-controllers')

const router = express.Router()

router.post('/register', authUser.register)
router.post('/login', authUser.login)

module.exports = router