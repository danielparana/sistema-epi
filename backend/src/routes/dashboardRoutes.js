const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas do dashboard exigem autenticação
router.use(authMiddleware);

router.get('/stats', dashboardController.getStats);

module.exports = router;