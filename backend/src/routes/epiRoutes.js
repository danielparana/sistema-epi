const router = require('express').Router()

const epiController = require('../controllers/epiController')

const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, epiController.list)

router.post('/', authMiddleware, epiController.create)

module.exports = router