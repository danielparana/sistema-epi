const prisma = require('../prisma/client')

class EmployeeController {
  async list(req, res) {
    try {
      const employees = await prisma.employee.findMany()
      return res.json(employees)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar funcionários' })
    }
  }

  async create(req, res) {
    const { nome, cpf, cargo } = req.body

    if (!nome || !cpf || !cargo) {
      return res.status(400).json({ error: 'Nome, CPF e cargo são obrigatórios' })
    }

    try {
      const employeeExists = await prisma.employee.findUnique({
        where: {
          cpf
        }
      })

      if (employeeExists) {
        return res.status(400).json({ error: 'CPF já cadastrado' })
      }

      const employee = await prisma.employee.create({
        data: {
          nome,
          cpf,
          cargo
        }
      })

      return res.status(201).json({
        message: 'Funcionário cadastrado',
        employee
      })
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao cadastrar funcionário' })
    }
  }
}

module.exports = new EmployeeController()