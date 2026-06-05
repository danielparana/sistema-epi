const prisma = require('../prisma/client')

class EpiController {
  async list(req, res) {
    try {
      const epis = await prisma.epi.findMany()
      return res.json(epis)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar EPIs' })
    }
  }

  async create(req, res) {
    const { nome, lote, quantidade, descricao, vencimento } = req.body

    if (!nome || !lote || quantidade == null) {
      return res.status(400).json({ error: 'Nome, lote e quantidade são obrigatórios' })
    }

    const parsedQuantidade = Number(quantidade)

    if (!Number.isInteger(parsedQuantidade) || parsedQuantidade < 0) {
      return res.status(400).json({ error: 'Quantidade deve ser um número inteiro não negativo' })
    }

    try {
      const loteExistente = await prisma.epi.findUnique({
        where: { lote: lote.trim() }
      })

      if (loteExistente) {
        return res.status(400).json({ error: 'Esse lote já existe' })
      }

      // validate vencimento if provided
      let parsedVencimento = null
      if (vencimento) {
        const d = new Date(vencimento)
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({ error: 'Data de vencimento inválida' })
        }
        parsedVencimento = d
      }

      const epi = await prisma.epi.create({
        data: {
          nome: nome.trim(),
          lote: lote.trim(),
          descricao: descricao ? descricao.trim() : null,
          quantidade: parsedQuantidade,
          initialQuantidade: parsedQuantidade,
          vencimento: parsedVencimento
        }
      })

      return res.status(201).json({
        message: 'EPI cadastrado',
        epi
      })
    } catch (error) {
      console.error('ERRO AO CADASTRAR EPI:')
      console.error(error)

      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Esse lote já existe' })
      }

      return res.status(500).json({
        error: error.message
      })
    }
  }

  async update(req, res) {
    const { id } = req.params
    const { nome, lote, quantidade, descricao, vencimento } = req.body

    if (!nome || !lote || quantidade == null) {
      return res.status(400).json({ error: 'Nome, lote e quantidade são obrigatórios' })
    }

    const parsedQuantidade = Number(quantidade)

    if (!Number.isInteger(parsedQuantidade) || parsedQuantidade < 0) {
      return res.status(400).json({ error: 'Quantidade deve ser um número inteiro não negativo' })
    }

    try {
      const epi = await prisma.epi.findUnique({
        where: { id: Number(id) }
      })

      if (!epi) {
        return res.status(404).json({ error: 'EPI não encontrado' })
      }

      if (epi.lote !== lote.trim()) {
        const loteExistente = await prisma.epi.findUnique({
          where: { lote: lote.trim() }
        })
        if (loteExistente) {
          return res.status(400).json({ error: 'Esse lote já existe' })
        }
      }

      let parsedVencimento = null
      if (vencimento) {
        const d = new Date(vencimento)
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({ error: 'Data de vencimento inválida' })
        }
        parsedVencimento = d
      }

      const updatedEpi = await prisma.epi.update({
        where: { id: Number(id) },
        data: {
          nome: nome.trim(),
          lote: lote.trim(),
          descricao: descricao ? descricao.trim() : null,
          quantidade: parsedQuantidade,
          vencimento: parsedVencimento
        }
      })
      // registrar histórico da edição
      try {
        const editorId = req.user?.id || null
        if (editorId) {
          await prisma.epiHistory.create({
            data: {
              epiId: Number(id),
              userId: editorId,
              previousNome: epi.nome,
              previousLote: epi.lote,
              previousDescricao: epi.descricao,
              previousQuantidade: epi.quantidade
            }
          })
        }
      } catch (err) {
        // não interromper a atualização principal se logging falhar
        console.error('Erro ao registrar histórico de EPI:', err)
      }

      return res.json({
        message: 'EPI atualizado',
        epi: updatedEpi
      })
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Esse lote já existe' })
      }
      return res.status(500).json({ error: 'Erro interno ao atualizar EPI' })
    }
  }

  async delete(req, res) {
    const { id } = req.params

    try {
      const deliveriesCount = await prisma.delivery.count({
        where: { epiId: Number(id) }
      })

      if (deliveriesCount > 0) {
        return res.status(400).json({ error: 'Não é possível excluir um EPI com entregas registradas' })
      }

      const epi = await prisma.epi.findUnique({
        where: { id: Number(id) }
      })

      if (!epi) {
        return res.status(404).json({ error: 'EPI não encontrado' })
      }

      await prisma.epi.delete({
        where: { id: Number(id) }
      })

      return res.json({ message: 'EPI excluído' })
    } catch (error) {
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Não é possível excluir um EPI com entregas registradas' })
      }
      return res.status(500).json({ error: 'Erro interno ao excluir EPI' })
    }
  }

  async history(req, res) {
    const { id } = req.params
    try {
      const history = await prisma.epiHistory.findMany({
        where: { epiId: Number(id) },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      })
      return res.json(history)
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar histórico' })
    }
  }
}

module.exports = new EpiController()