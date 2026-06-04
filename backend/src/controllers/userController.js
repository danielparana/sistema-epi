const bcrypt = require('bcryptjs')
const prisma = require('../prisma/client')

class UserController {

  async create(req, res) {

    const {
      name,
      email,
      password
    } = req.body

    const userExistis = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (userExistis) {

      return res.status(400).json({
        error: 'Usuário já existe'
      })

    }

    const passwordHash = await bcrypt.hash(password, 8)

    const user = await prisma.user.create({

      data: {
        name,
        email,
        passwordHash
      }

    })

    return res.status(201).json({
      message: 'Usuário criado',
      user

    })

  }

}

module.exports = new UserController()