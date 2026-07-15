const router = require('express').Router()

const reportController = require('../controllers/reportController')

const authMiddleware = require('../middlewares/authMiddleware')
const checkRole = require('../middlewares/checkRole')

router.use(authMiddleware)

router.get('/', checkRole(['ADMIN', 'GERENTE']), reportController.list)

module.exports = router