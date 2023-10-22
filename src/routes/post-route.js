const express = require('express');

const router = express.Router()
const authenticateMiddleware = require('../middlwares/authenticate')
const uploadMiddleware = require('../middlwares/upload');
const postMiddleware = require('../controllers/post-controller');

router.post('/'
    , authenticateMiddleware
    , (req, res, next) => {
        console.log("to Route Post"),
            next()
    }
    , uploadMiddleware.array('image')
    , (req, res, next) => {
        console.log("to Route Upload Middleware"),
            next()
    }
    , postMiddleware.createPost
)

module.exports = router;