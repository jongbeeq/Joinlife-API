const express = require('express');

const router = express.Router()
const authenticateMiddleware = require('../middlwares/authenticate')
const uploadMiddleware = require('../middlwares/upload');
const postMiddleware = require('../controllers/post-controller');

router.post('/'
    , authenticateMiddleware
    , uploadMiddleware.array('image')
    , postMiddleware.createPost
)

router.get("/",
    authenticateMiddleware,
    postMiddleware.getAllPost
)

module.exports = router;