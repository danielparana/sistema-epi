const prisma = require('../prisma/client');
const { enviarEmailAlertaVencimento } = require('./emailService');

// Retorna a data atual no formato YYYY-MM-DD (UTC)
function getTodayUTC() {

    const now = new Date();

    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


// Calcula diferença entre duas datas YYYY-MM-DD
function daysBetween(dateStr1, dateStr2) {

    const d1 = new Date(`${dateStr1}T00:00:00.000Z`);
    const d2 = new Date(`${dateStr2}T00:00:00.000Z`);

    const diffTime = d2 - d1;

    return Math.round(
        diffTime / (1000 * 60 * 60 * 24)
    );
}


async function verificarEPIsProximosDoVencimento() {

    const hojeStr = getTodayUTC();

    console.log(`📅 Data utilizada na verificação: ${hojeStr}`);

    const epis = await prisma.epi.findMany({

        where: {
            vencimento: {
                not: null
            }
        },

        include: {

            deliveries: {

                include: {

                    employee: {

                        include: {

                            sector: {

                                include: {
                                    responsible: true
                                }

                            }

                        }

                    }

                }

            }

        }

    });


    for (const epi of epis) {

        // Converte a data do Prisma para YYYY-MM-DD
        const vencimentoStr =
            new Date(epi.vencimento)
                .toISOString()
                .split('T')[0];


        const diasParaVencer =
            daysBetween(
                hojeStr,
                vencimentoStr
            );


        // Dias que geram alerta
        const diasDeAlerta = [15, 10, 5];


        if (!diasDeAlerta.includes(diasParaVencer)) {
            continue;
        }


        console.log(
            `🔎 EPI ${epi.nome}: vence em ${diasParaVencer} dias.`
        );


        // Verifica se este alerta já foi enviado
        const alertaExistente =
            await prisma.emailAlert.findUnique({

                where: {

                    epiId_diasAlerta: {

                        epiId: epi.id,

                        diasAlerta: diasParaVencer

                    }

                }

            });


        if (alertaExistente) {

            console.log(
                `ℹ️ Alerta de ${diasParaVencer} dias já enviado para o EPI ${epi.nome}.`
            );

            continue;

        }


        for (const entrega of epi.deliveries) {

            const funcionario =
                entrega.employee;

            const setor =
                funcionario.sector;

            const responsavel =
                setor?.responsible;


            if (!responsavel) {

                console.log(
                    `⚠️ Funcionário ${funcionario.nome} não possui responsável cadastrado.`
                );

                continue;

            }


            console.log(
                `📧 Enviando alerta de ${diasParaVencer} dias.`
            );

            console.log(
                `Funcionário: ${funcionario.nome}`
            );

            console.log(
                `Matrícula: ${funcionario.id}`
            );

            console.log(
                `Setor: ${setor.nome}`
            );

            console.log(
                `Responsável: ${responsavel.nome} - ${responsavel.email}`
            );


            await enviarEmailAlertaVencimento({

                destinatario:
                    responsavel.email,

                funcionario:
                    funcionario.nome,

                matricula:
                    funcionario.id,

                setor:
                    setor.nome,

                epi:
                    epi.nome,

                lote:
                    epi.lote,

                vencimento:
                    epi.vencimento,

                diasParaVencer

            });

        }


        // Registra que o alerta foi enviado
        await prisma.emailAlert.create({

            data: {

                epiId:
                    epi.id,

                diasAlerta:
                    diasParaVencer

            }

        });


        console.log(
            `✅ Alerta de ${diasParaVencer} dias registrado no banco.`
        );

    }

}


module.exports = {
    verificarEPIsProximosDoVencimento
};