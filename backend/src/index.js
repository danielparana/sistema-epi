require('dotenv').config({ path: './.env' })

const express = require('express')
const cors = require('cors')

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

app.use('/employees', employeeRoutes)
app.use('/users', userRoutes)

app.use(authRoutes)
app.use('/epis', epiRoutes)
app.use('/deliveries', deliveryRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})