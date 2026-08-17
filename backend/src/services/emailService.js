const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true para porta 465 (SSL)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    family: 4 // força IPv4, evita o erro ENETUNREACH em ambientes sem saída IPv6 (ex: Render)
});

async function enviarEmailTeste() {

    const info = await transporter.sendMail({
        from: `"Sistema EPI" <${process.env.EMAIL_USER}>`,
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

    console.log("E-mail enviado:", info.messageId);
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

    const info = await transporter.sendMail({

        from: `"Sistema EPI" <${process.env.EMAIL_USER}>`,

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

    console.log(
        `📧 Alerta enviado com sucesso: ${info.messageId}`
    );
}

module.exports = {
    enviarEmailTeste,
    enviarEmailAlertaVencimento
};