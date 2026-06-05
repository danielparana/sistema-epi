const prisma = require('../prisma/client')

class DeliveryController {
  async list(req, res) {
    try {
      const deliveries = await prisma.delivery.findMany({
        include: {
          employee: true,
          epi: true
        }
      })
      return res.json(deliveries)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar entregas' })
    }
  }

  async create(req, res) {
    const { employeeId, epiId, quantidade } = req.body
    const parsedEmployeeId = Number(employeeId)
    const parsedEpiId = Number(epiId)
    const parsedQuantidade = Number(quantidade)

    if (
      !parsedEmployeeId ||
      !parsedEpiId ||
      !Number.isInteger(parsedQuantidade) ||
      parsedQuantidade <= 0
    ) {
      return res.status(400).json({ error: 'EmployeeId, epiId e quantidade válidos são obrigatórios' })
    }

    try {
      const employee = await prisma.employee.findUnique({
        where: {
          id: parsedEmployeeId
        }
      })

      if (!employee) {
        return res.status(404).json({ error: 'Funcionário não encontrado' })
      }

      const epi = await prisma.epi.findUnique({
        where: {
          id: parsedEpiId
        }
      })

      if (!epi) {
        return res.status(404).json({ error: 'EPI não encontrado' })
      }

      if (epi.quantidade < parsedQuantidade) {
        return res.status(400).json({ error: 'Estoque insuficiente' })
      }

      const [delivery] = await prisma.$transaction([
        prisma.delivery.create({
          data: {
            employeeId: parsedEmployeeId,
            epiId: parsedEpiId,
            quantidade: parsedQuantidade
          }
        }),
        prisma.epi.update({
          where: {
            id: parsedEpiId
          },
          data: {
            quantidade: epi.quantidade - parsedQuantidade
          }
        })
      ])

      return res.status(201).json({
        message: 'Entrega realizada',
        delivery
      })
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao registrar entrega' })
    }
  }
}

module.exports = new DeliveryController()