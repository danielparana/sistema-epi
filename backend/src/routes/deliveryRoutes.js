const router = require('express').Router()

const deliveryController = require('../controllers/deliveryController')

const authMiddleware = require('../middlewares/authMiddleware')
const checkRole = require('../middlewares/checkRole')

router.use(authMiddleware)


router.get('/', checkRole(['ADMIN', 'GERENTE']), deliveryController.list)

router.post('/', checkRole(['ADMIN', 'GERENTE']), deliveryController.create)

module.exports = router