const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma/client')


class AuthController {

  async login(req, res) {

    const {
      email,
      password
    } = req.body

    try {

      const user = await prisma.user.findUnique({
        where: {
          email
        }
      })

      if (!user) {
        return res.status(404).json({
          message: 'Usuário não encontrado'
        })
      }

      const passwordMatch = await bcrypt.compare(
        password,
        user.passwordHash
      )

      if (!passwordMatch) {
        return res.status(401).json({
          message: 'Senha inválida'
        })
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1d'
        }
      )

      return res.json({
        message: 'Login realizado',
        token
      })

    } catch (error) {

      return res.status(500).json({
        error: error.message
      })

    }

  }

}
    

module.exports = new AuthController()