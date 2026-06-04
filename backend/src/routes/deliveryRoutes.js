const router = require('express').Router()

const deliveryController = require('../controllers/deliveryController')

const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, deliveryController.list)

router.post('/', authMiddleware, deliveryController.create)

module.exports = router