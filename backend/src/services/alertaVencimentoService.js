const prisma = require('../prisma/client');
const { enviarEmailAlertaVencimento } = require('./emailService');

async function verificarEPIsProximosDoVencimento() {

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

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

        const diasParaVencer = Math.ceil(
            (new Date(epi.vencimento) - hoje) /
            (1000 * 60 * 60 * 24)
        );

        // Alertas que devem gerar e-mail
        const diasDeAlerta = [15, 10, 5];

        if (!diasDeAlerta.includes(diasParaVencer)) {
            continue;
        }

        // Verifica se este alerta já foi enviado para este EPI
        const alertaExistente = await prisma.emailAlert.findUnique({
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

            const funcionario = entrega.employee;
            const setor = funcionario.sector;
            const responsavel = setor?.responsible;

            if (!responsavel) {

                console.log(
                    `⚠️ Funcionário ${funcionario.nome} não possui responsável cadastrado.`
                );

                continue;
            }

            console.log(
                `📧 EPI ${epi.nome} está a ${diasParaVencer} dias do vencimento.`
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

                destinatario: responsavel.email,

                funcionario: funcionario.nome,

                matricula: funcionario.id,

                setor: setor.nome,

                epi: epi.nome,

                lote: epi.lote,

                vencimento: epi.vencimento,

                diasParaVencer

            });
        }

        // Registra que o alerta foi enviado
        await prisma.emailAlert.create({

            data: {
                epiId: epi.id,
                diasAlerta: diasParaVencer
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