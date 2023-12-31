const express = require('express');

const router = express.Router();

const authenticateMiddleware = require('../middlwares/authenticate')
const uploadMiddleware = require('../middlwares/upload')
const userMiddleware = require('../controllers/user-controller')

router.patch(
    '/',
    authenticateMiddleware,
    uploadMiddleware.single('image'),
    userMiddleware.updateProfile,
)

router.get(
    '/:userId',
    authenticateMiddleware,
    userMiddleware.getUserById
)

module.exports = router
