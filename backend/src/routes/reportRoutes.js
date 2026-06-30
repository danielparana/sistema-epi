const router = require('express').Router()

const reportController = require('../controllers/reportController')

const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, reportController.list)

module.exports = router