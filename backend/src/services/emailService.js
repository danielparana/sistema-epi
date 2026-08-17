const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Remetente padrão do Resend no plano free (sem domínio verificado).
// Depois que você verificar um domínio próprio, pode trocar por
// algo como "Sistema EPI <alertas@seudominio.com.br>".
const REMETENTE = "Sistema EPI <onboarding@resend.dev>";

async function enviarEmailTeste() {

    const { data, error } = await resend.emails.send({
        from: REMETENTE,
        to: "sistemaepisenai@gmail.com",
        subject: "Teste de envio - Sistema EPI",
        html: `
            <h2>Teste de e-mail</h2>

            <p>Olá!</p>

            <p>
                Este é um teste de envio de e-mail
                realizado pelo <strong>Sistema EPI</strong>.
            </p>

            <p>
                O serviço de envio está funcionando corretamente.
            </p>

            <hr>

            <p>
                Sistema EPI - SENAI
            </p>
        `
    });

    if (error) {
        console.error("Erro ao enviar e-mail de teste:", error);
        throw error;
    }

    console.log("E-mail enviado:", data.id);
}

function formatarData(data) {
    const dataObj = new Date(data);

    return `${String(dataObj.getUTCDate()).padStart(2, "0")}/${
        String(dataObj.getUTCMonth() + 1).padStart(2, "0")
    }/${dataObj.getUTCFullYear()}`;
}

async function enviarEmailAlertaVencimento({
    destinatario,    funcionario,    matricula,
    setor,    epi,    lote,    vencimento,    diasParaVencer}) {


    console.log(`📨 Enviando e-mail para: ${destinatario}`);

    const { data, error } = await resend.emails.send({

        from: REMETENTE,

        to: destinatario,

        subject: `⚠️ Alerta de vencimento - ${epi}`,

        html: `

            <h2>⚠️ Alerta de vencimento de EPI</h2>

            <p>
                O seguinte equipamento está próximo do vencimento:
            </p>

            <hr>

            <p>
                <strong>EPI:</strong> ${epi}
            </p>

            <p>
                <strong>Lote:</strong> ${lote}
            </p>

            <p>
                <strong>Validade:</strong>
                ${formatarData(vencimento)}
            </p>

            <p>
                <strong>Dias para vencer:</strong>
                ${diasParaVencer}
            </p>

            <hr>

            <h3>Funcionário</h3>

            <p>
                <strong>Nome:</strong> ${funcionario}
            </p>

            <p>
                <strong>Matrícula:</strong> ${matricula}
            </p>

            <p>
                <strong>Setor:</strong> ${setor}
            </p>

            <hr>

            <p>
                Favor verificar a situação deste EPI.
            </p>

            <br>

            <p>
                <strong>Sistema EPI - SENAI</strong>
            </p>

        `
    });

    if (error) {
        console.error("Erro ao enviar alerta de vencimento:", error);
        throw error;
    }

    console.log(
        `📧 Alerta enviado com sucesso: ${data.id}`
    );
}

module.exports = {
    enviarEmailTeste,
    enviarEmailAlertaVencimento
};
