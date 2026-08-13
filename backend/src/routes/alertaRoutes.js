const express = require("express");
const {
    verificarEPIsProximosDoVencimento
} = require("../services/alertaVencimentoService");

const router = express.Router();

router.get("/verificar", async (req, res) => {

    try {

        const chave = req.query.key;

        if (chave !== process.env.ALERTA_SECRET) {
            return res.status(401).json({
                error: "Não autorizado",

                 debug: {
                    chaveRecebidaDaURL: chave,
                    variavelDoRenderExiste: process.env.ALERTA_SECRET ?
                    "Sim, existe no servidor" : "Não, está undefined/vazia"
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