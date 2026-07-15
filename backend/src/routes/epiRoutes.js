const router = require('express').Router()
const epiController = require('../controllers/epiController')
const authMiddleware = require('../middlewares/authMiddleware')

const checkRole = require('../middlewares/checkRole')


router.use(authMiddleware)

// ADM e GERENTE 
router.get('/', checkRole(['ADMIN', 'GERENTE']), epiController.list)
router.post('/', checkRole(['ADMIN', 'GERENTE']), epiController.create)
router.put('/:id', checkRole(['ADMIN', 'GERENTE']), epiController.update)

// só o ADM
router.delete('/:id', checkRole(['ADMIN']), epiController.delete)

// ADM e GERENTE
router.get('/:id/history', checkRole(['ADMIN', 'GERENTE']), epiController.history)

module.exports = router