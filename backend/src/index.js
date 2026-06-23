const dotenv = require('dotenv')
dotenv.config()



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
    const hoje = new Date()
    hoje.setHours(0, 0, 0, )

    const daqui30Dias = new Date()
    daqui30Dias.setDate(hoje.getDate() + 30)
    daqui30Dias.setHours(23, 59, 59, 999)

    const epis = await prisma.epi.findMany({
      orderBy: {
        nome: 'asc'
      }
    })

    const totalFuncionarios = await prisma.employee.count()

    const proximosVencimento = await prisma.epi.findMany({
      where: {
        vencimento: {
          gte: hoje,
          lte: daqui30Dias
        }
      },
      orderBy: {
        vencimento: 'asc'
      }
    })

    const vencidos = await prisma.epi.findMany({
      where: {
        vencimento: {
          lt: hoje
        }
      },
      orderBy: {
        vencimento: 'asc'
      }
    })

    console.log('Hoje:', hoje)
    console.log('Daqui 30 dias:', daqui30Dias)
    console.log('Próximos:', proximosVencimento)
    console.log('Vencidos:', vencidos)

    return res.json({
      epis,
      totalFuncionarios,
      proximosVencimento,
      vencidos
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: error.message
    })
  }
})

app.use('/employees', employeeRoutes)
app.use('/users', userRoutes)
app.use('/auth', authRoutes)
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