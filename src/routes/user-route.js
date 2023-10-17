const express = require('express');

const router = express.Router();

const authenticateMiddleware = require('../middlwares/authenticate')
const uploadMiddleware = require('../middlwares/upload');
const userMiddleware = require('../controllers/user-controller')

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

router.patch('/'
    , authenticateMiddleware
    , uploadMiddleware.single('image')
    // , upload.single('image')
    , userMiddleware.updateProfile
)

module.exports = router
