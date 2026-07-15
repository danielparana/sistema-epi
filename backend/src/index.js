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
const reportRoutes = require('./routes/reportRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  return res.json({
    status: 'online',
    message: 'API Sistema EPI funcionando'
  })
})


app.use('/dashboard', dashboardRoutes)

app.use('/employees', employeeRoutes)
app.use('/users', userRoutes)
app.use('/auth', authRoutes)
app.use('/epis', epiRoutes)
app.use('/deliveries', deliveryRoutes)
app.use('/reports', reportRoutes)
app.use('/dashboard', dashboardRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  if (res.headersSent) return next(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})