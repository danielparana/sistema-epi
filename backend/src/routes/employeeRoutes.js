const router = require('express').Router()

const employeeController = require('../controllers/employeeController')

const authMiddleware = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/', employeeController.list)

router.post('/', employeeController.create)

module.exports = router