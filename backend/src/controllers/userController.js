const bcrypt = require('bcryptjs')
const prisma = require('../prisma/client')

class UserController {

  // LISTAR USUÁRIOS
  async list(req, res) {
    try {
      const users = await prisma.user.findMany({
        orderBy: {
          name: 'asc'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          employee: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      })

      return res.json(users)

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao listar usuários'
      })
    }
  }

  // CRIAR USUÁRIO
  async create(req, res) {
    const { name, email, password, role, employeeId } = req.body

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

    const rolesValidos = ['ADMIN', 'GERENTE', 'FUNCIONARIO']

    if (role && !rolesValidos.includes(role)) {
      return res.status(400).json({
        error: 'Perfil inválido'
      })
    }

    try {
      const userExists = await prisma.user.findUnique({
        where: { email }
      })

      if (userExists) {
        return res.status(400).json({
          error: 'Usuário já existe'
        })
      }

      if (employeeId) {
        const employee = await prisma.employee.findUnique({
          where: { id: employeeId }
        })

        if (!employee) {
          return res.status(400).json({
            error: 'Funcionário não encontrado'
          })
        }
      }

      const passwordHash = await bcrypt.hash(password, 8)

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: role || 'FUNCIONARIO',
          employeeId: employeeId || null
        }
      })

      return res.status(201).json({
        message: 'Usuário criado',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
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