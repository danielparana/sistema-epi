const prisma = require('../prisma/client');

class DashboardController {

  async getStats(req, res) {

    try {

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Busca todos os EPIs com os funcionários que os receberam
      const epis = await prisma.epi.findMany({

        
        include: {

          deliveries: {

            include: {
              employee: true
            }

          }

        },

        orderBy: {
          vencimento: 'asc'
        }

      });

      let estoqueTotal = 0;

      let verde = 0;
      let amarelo = 0;
      let laranja = 0;
      let vermelho = 0;

      const alertas = [];

      for (const epi of epis) {

        estoqueTotal += epi.quantidade;

        // ignora EPIs sem vencimento
        if (!epi.vencimento) continue;

        const diasParaVencer = Math.ceil(

          (new Date(epi.vencimento) - hoje) /
          (1000 * 60 * 60 * 24)

        );

        let status = "";

        if (diasParaVencer < 0) {

          vermelho++;
          status = "vermelho";

        }

        else if (diasParaVencer <= 30) {

          laranja++;
          status = "laranja";

        }

        else if (diasParaVencer <= 45) {

          amarelo++;
          status = "amarelo";

        }

        else {

          verde++;
          status = "verde";

        }

        // Somente mostra alerta para amarelo, laranja e vermelho
        if (status !== "verde") {

          alertas.push({

            id: epi.id,

            nome: epi.nome,

            lote: epi.lote,

            quantidade: epi.quantidade,

            vencimento: epi.vencimento,

            diasParaVencer,

            status,

            funcionarios:

              epi.deliveries.map(entrega => ({
                id: entrega.employee.id,
                nome: entrega.employee.nome,
                dataEntrega: entrega.dataEntrega
              }))

          });

        }

      }

      const totalFuncionarios =
        await prisma.employee.count();

      return res.json({

        estoqueTotal,

        totalFuncionarios,

        verde,

        amarelo,

        laranja,

        vermelho,

        alertas,

        epis

      });

    }

    catch (error) {

      console.error(error);

      return res.status(500).json({

        error: "Erro ao carregar dashboard"

      });

    }

  }

}

module.exports = new DashboardController();