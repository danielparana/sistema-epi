const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma/client')


class AuthController {
  async login(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'E-mail e senha são obrigatórios'
      })
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          email
        }
      })

      if (!user) {
        return res.status(401).json({
          message: 'Usuário ou senha inválidos'
        })
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash)

      if (!passwordMatch) {
        return res.status(401).json({
          message: 'Usuário ou senha inválidos'
        })
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1d'
        }
      )

      return res.json({
        message: 'Login realizado',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      return res.status(500).json({
        error: 'Erro interno ao realizar login'
      })
    }
  }

  async me(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id
        }
      })

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        })
      }

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      })
    } catch (error) {
      return res.status(500).json({
        error: 'Erro interno ao obter usuário'
      })
    }
  }
}
    

module.exports = new AuthController()