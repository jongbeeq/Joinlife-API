const express = require('express');

const router = express.Router()
const authenticateMiddleware = require('../middlwares/authenticate')
const uploadMiddleware = require('../middlwares/upload');
const postMiddleware = require('../controllers/post-controller');

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

router.post('/'
    , authenticateMiddleware
    , uploadMiddleware.array('image')
    , postMiddleware.createPost
)


module.exports = router;