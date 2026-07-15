const router = require('express').Router()

const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const checkRole = require('../middlewares/checkRole')

// LISTAR USUÁRIOS (somente ADMIN)
router.get(  '/',  authMiddleware,  checkRole(['ADMIN']),
  userController.list)

// CRIAR USUÁRIO (somente ADMIN)
router.post(  '/',  authMiddleware,  checkRole(['ADMIN']),
  userController.create)

module.exports = router