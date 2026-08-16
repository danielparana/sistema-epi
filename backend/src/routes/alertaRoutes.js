const express = require("express");
const {
    verificarEPIsProximosDoVencimento
} = require("../services/alertaVencimentoService");

const router = express.Router();

router.get("/verificar", async (req, res) => {

    try {

        console.log("Chave recebida da URL:", req.query.key ? "sim" : "não");
        console.log("ALERTA_SECRET configurado:", process.env.ALERTA_SECRET ? "sim" : "não");

       const chave = req.query.key;

        console.log("🔎 Chave recebida:", chave ? "SIM" : "NÃO");
        console.log(
            "🔎 ALERTA_SECRET existe:",
            process.env.ALERTA_SECRET ? "SIM" : "NÃO"
        );

        if (!process.env.ALERTA_SECRET) {
            return res.status(500).json({
                error: "ALERTA_SECRET não está configurado no servidor"
            });
        }

        if (chave !== process.env.ALERTA_SECRET) {
            return res.status(401).json({
                error: "Não autorizado",
                debug: {
                    chaveRecebida: chave ? "SIM" : "NÃO",
                    alertaSecretExiste: "SIM",
                    tamanhoChaveRecebida: chave?.length,
                    tamanhoChaveServidor: process.env.ALERTA_SECRET.length
                }
            });
        }

        await verificarEPIsProximosDoVencimento();

        return res.json({
            message: "Verificação de alertas para e-mails executada com sucesso."
        });

    } catch (error) {

        console.error("Erro ao verificar alertas:", error);

        return res.status(500).json({
            error: "Erro ao verificar alertas"
        });

    }

});

module.exports = router;