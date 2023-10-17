const express = require('express');

const categoryMiddleware = require('../controllers/category-controller')
const router = express.Router()

router.get('/', categoryMiddleware.getCategory)


module.exports = router;