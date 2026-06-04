const prisma = require('../prisma/client')

class EmployeeController {

  async list(req, res) {

    const employees = await prisma.employee.findMany()

    return res.json(employees)

  }

  async create(req, res) {

    const {
      nome,
      cpf,
      cargo
    } = req.body

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

  }

}

module.exports = new EmployeeController()