const dotenv = require("dotenv");
dotenv.config();

const {
    verificarEPIsProximosDoVencimento
} = require("./src/services/alertaVencimentoService");

async function executar() {

    console.log("🔎 Iniciando verificação de alertas...");

    try {

        await verificarEPIsProximosDoVencimento();

        console.log("✅ Verificação de alertas concluída.");

    } catch (error) {

        console.error("❌ Erro ao verificar alertas:");
        console.error(error);

    }

}

executar();