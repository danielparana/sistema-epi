require('dotenv').config({ path: './.env' })

const express = require('express')
const cors = require('cors')

const prisma = require('./prisma/client')
const authMiddleware = require('./middlewares/authMiddleware')

const employeeRoutes = require('./routes/employeeRoutes')
const userRoutes = require('./routes/userRoutes')
const authRoutes = require('./routes/authRoutes')
const epiRoutes = require('./routes/epiRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  return res.json({
    status: 'online',
    message: 'API Sistema EPI funcionando'
  })
})

app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const agora = new Date()
    const proximos30Dias = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

    const estoqueTotal = await prisma.epi.aggregate({
      _sum: {
        quantidade: true
      }
    })

    const totalFuncionarios = await prisma.employee.count()
    const totalEntregas = await prisma.delivery.count()

    const proximosVencimento = 0
    const vencidos = 0

    return res.json({
      totalEpis: estoqueTotal._sum.quantidade || 0,
      totalFuncionarios,
      totalEntregas,
      proximosVencimento,
      vencidos
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.use('/employees', employeeRoutes)
app.use('/users', userRoutes)

app.use('/auth', authRoutes)
app.use(authRoutes)
app.use('/epis', epiRoutes)
app.use('/deliveries', deliveryRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  if (res.headersSent) return next(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})