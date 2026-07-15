const router = require('express').Router()

const employeeController = require('../controllers/employeeController')
const authMiddleware = require('../middlewares/authMiddleware')
const checkRole = require('../middlewares/checkRole')

// todas as rotas exigem login
router.use(authMiddleware)

// LISTAR funcionários (ADMIN e GERENTE)
router.get(  '/',  checkRole(['ADMIN', 'GERENTE']),
  employeeController.list)
//router.get('/', employeeController.list)

// CRIAR funcionários (ADMIN e GERENTE)
router.post(  '/',  checkRole(['ADMIN', 'GERENTE']),
  employeeController.create)
//router.post('/', employeeController.create)


// EDITAR (ADMIN + GERENTE)
router.put(  '/:id',  checkRole(['ADMIN', 'GERENTE']),
  employeeController.update)
//router.put('/:id', employeeController.update)


// DELETAR (somente ADMIN)
router.delete(  '/:id',  checkRole(['ADMIN']),
  employeeController.delete)  

module.exports = router