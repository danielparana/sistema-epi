const prisma = require('../prisma/client');

class DashboardController {
  async getStats(req, res) {
    try {
      const hoje = new Date();
      const dias30 = new Date();
      dias30.setDate(hoje.getDate() + 30);

      // Ajustar para comparar apenas as datas dos Epis
      hoje.setHours(0, 0, 0, 0);
      dias30.setHours(23, 59, 59, 999);

      // 1. Total de EPIs em estoque 
      const totalEstoque = await prisma.epi.aggregate({
        _sum: {
          quantidade: true
        }
      });

      // 2. Total de funcionários cadastrados
      const totalFuncionarios = await prisma.employee.count();

      // 3. EPIs próximos do vencimento (próximos 30 dias)
      const proximosVencimento = await prisma.epi.count({
        where: {
          vencimento: {
            gte: hoje,
            lte: dias30
          },
          quantidade: {
            gt: 0
          }
        }
      });

      // 4. EPIs vencidos
      const vencidos = await prisma.epi.count({
        where: {
          vencimento: {
            lt: hoje
          },
          quantidade: {
            gt: 0
          }
        }
      });

      // 5. Lista de alertas (EPIs próximos a vencer e vencidos)
      const alertas = await prisma.epi.findMany({
        where: {
          OR: [
            {
              vencimento: {
                lte: dias30
              }
            },
            {
              vencimento: {
                lt: hoje
              }
            }
          ],
          quantidade: {
            gt: 0
          }
        },
        orderBy: {
          vencimento: 'asc'
        },
        take: 10 // Limitar a 10 alertas
      });

      
      const alertasFormatados = alertas.map(epi => {
        const diasParaVencer = Math.ceil((new Date(epi.vencimento) - hoje) / (1000 * 60 * 60 * 24));
        let status = '';
        let mensagem = '';

        if (diasParaVencer < 0) {
          status = 'vencido';
          mensagem = `${epi.nome} - Lote ${epi.lote} está VENCIDO!`;
        } else if (diasParaVencer === 0) {
          status = 'hoje';
          mensagem = `${epi.nome} - Lote ${epi.lote} vence HOJE!`;
        } else if (diasParaVencer <= 5) {
          status = 'critico';
          mensagem = `${epi.nome} - Lote ${epi.lote} vence em ${diasParaVencer} dias (URGENTE!)`;
        } else {
          status = 'alerta';
          mensagem = `${epi.nome} - Lote ${epi.lote} vence em ${diasParaVencer} dias`;
        }

        return {
          id: epi.id,
          mensagem,
          status,
          diasParaVencer,
          vencimento: epi.vencimento
        };
      });

      return res.json({
        totalEpis: totalEstoque._sum.quantidade || 0,
        totalFuncionarios,
        proximosVencimento,
        vencidos,
        alertas: alertasFormatados
      });

    } catch (error) {
      console.error('Erro no dashboard:', error);
      return res.status(500).json({ 
        error: 'Erro ao carregar dados do dashboard',
        details: error.message 
      });
    }
  }
}

module.exports = new DashboardController();