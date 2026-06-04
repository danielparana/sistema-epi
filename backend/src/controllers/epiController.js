const prisma = require('../prisma/client')

class EpiController {

  async list(req, res) {

    const epis = await prisma.epi.findMany()

    return res.json(epis)

  }

  async create(req, res) {

    const {
      nome,
      lote,
      quantidade,
      validade
    } = req.body

    const epi = await prisma.epi.create({

      data: {
        nome,
        lote,
        quantidade,
        validade: new Date(validade)
      }

    })

    return res.status(201).json({
      message: 'EPI cadastrado',
      epi
    })

  }

}

module.exports = new EpiController()