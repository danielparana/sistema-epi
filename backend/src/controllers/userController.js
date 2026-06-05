const bcrypt = require('bcryptjs')
const prisma = require('../prisma/client')

class UserController {
  async create(req, res) {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Nome, e-mail e senha são obrigatórios'
      })
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        error: 'E-mail inválido'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 6 caracteres'
      })
    }

    try {
      const userExists = await prisma.user.findUnique({
        where: {
          email
        }
      })

      if (userExists) {
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
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      })
    } catch (error) {
      return res.status(500).json({
        error: 'Erro interno ao criar usuário'
      })
    }
  }
}

module.exports = new UserController()