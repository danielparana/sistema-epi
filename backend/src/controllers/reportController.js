const prisma = require('../prisma/client')

class ReportController {
  async list(req, res) {
    try {

      const {
        startDate,
        endDate,
        employeeId,
        epiId
      } = req.query

      const where = {}

      // Filtro por período
      if (startDate || endDate) {

        where.dataEntrega = {}

        if (startDate) {
          const inicio = new Date('${startDate}T00:00:00')
          where.dataEntrega.gte = new Date(startDate)
        }

        if (endDate) {
          const finalDate = new Date(`${endDate}T23:59:59.999`)
          where.dataEntrega.lte = finalDate

        }

      }

      // Filtro por funcionário
      if (employeeId) {
        where.employeeId = Number(employeeId)
      }

      // Filtro por EPI
      if (epiId) {
        where.epiId = Number(epiId)
      }

      
      const reports = await prisma.delivery.findMany({

        where,

        include: {
          employee: true,
          epi: true
        },

        orderBy: {
          dataEntrega: 'desc'
        }

      })

      return res.json(reports)

    } catch (error) {

      console.error(error)

      return res.status(500).json({
        error: 'Erro ao gerar relatório'
      })

    }
  }
}

module.exports = new ReportController()