const prisma = require('../prisma/client')

class DeliveryController {

  async list(req, res) {

    const deliveries = await prisma.delivery.findMany({

      include: {
        employee: true,
        epi: true
      }

    })

    return res.json(deliveries)

  }

  async create(req, res) {

    const {
      employeeId,
      epiId,
      quantidade
    } = req.body

    // BUSCAR EPI

    const epi = await prisma.epi.findUnique({
      where: {
        id: epiId
      }
    })

    // VALIDAR ESTOQUE

    if (!epi) {

      return res.status(404).json({
        error: 'EPI não encontrado'
      })

    }

    if (epi.quantidade < quantidade) {

      return res.status(400).json({
        error: 'Estoque insuficiente'
      })

    }

    // CRIAR ENTREGA

    const delivery = await prisma.delivery.create({

      data: {
        employeeId,
        epiId,
        quantidade
      }

    })

    // BAIXAR ESTOQUE

    await prisma.epi.update({

      where: {
        id: epiId
      },

      data: {
        quantidade: epi.quantidade - quantidade
      }

    })

    return res.status(201).json({
      message: 'Entrega realizada',
      delivery
    })

  }

}

module.exports = new DeliveryController()