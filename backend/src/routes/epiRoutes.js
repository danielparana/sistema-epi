const router = require('express').Router()

const epiController = require('../controllers/epiController')

const authMiddleware = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, epiController.list)

router.post('/', authMiddleware, epiController.create)

router.put('/:id', authMiddleware, epiController.update)
router.delete('/:id', authMiddleware, epiController.delete)
router.get('/:id/history', authMiddleware, epiController.history)

module.exports = router