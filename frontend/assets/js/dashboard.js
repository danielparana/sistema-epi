const token = localStorage.getItem("token");

// Verifica login
if (!token) {
    window.location.href = "login.html";
}

let epiDashboard = [];
let dashboardData = null;

let chaveAtualPopup = null;

// ==========================
// CARREGA DADOS DO DASHBOARD
// ==========================

function abrirModal(titulo, conteudo) {

    document.getElementById("modalTitle").innerHTML = titulo;

    document.getElementById("modalBody").innerHTML = conteudo;

    document
        .getElementById("modalOverlay")
        .classList.remove("hidden");

}

function fecharModal() {

    document
        .getElementById("modalOverlay")
        .classList.add("hidden");

    if (chaveAtualPopup) {
        localStorage.setItem(chaveAtualPopup, "visualizado");
        
    }

}

function verificarLembrete(data) {

    // sem alertas ele não aparece
    if (data.alertas.length === 0) {
        return;
    }

    const agora = new Date();

    const hora = agora.getHours();
    const minuto = agora.getMinutes();

    let periodo = null;

    // das 8h às 11:39h
    if (hora >= 8 && hora < 11 || (hora === 11 && minuto < 40)) {
        periodo = "08";
    }
    // das 11:40h às 16:59h
    else if (hora === 11 && minuto >= 40 || (hora > 11 && hora < 17)) {
        periodo = "1140";   
    }

    // das 17h às 19:59h
    else if (hora >= 17 ) {
        periodo = "1700";       
    }

    
    if (!periodo) {
        return;
    }

   
   const ano = agora.getFullYear();
   const mes = String(agora.getMonth() + 1).padStart(2, '0');
   const dia = String(agora.getDate()).padStart(2, '0');
   const dataAtual = `${ano}-${mes}-${dia}`;

   const chave = `popup_${dataAtual}_${periodo}`;

    console.log("Chave:", chave);

    const popupExibido = localStorage.getItem(chave);

    if (popupExibido) {
        console.log("Aviso já exibido período.");
        return;
    }   


    const vencidos = data.alertas.filter(a => a.status === "vermelho");
    const proximos = data.alertas.filter(a => a.status === "laranja");
    const preventivos = data.alertas.filter(a => a.status === "amarelo");

    const principais = data.alertas.slice(0, 3);

    const listaPrincipais = principais.map(alerta => {

        let icone = "🟢";

        if (alerta.status === "vermelho") icone = "🔴";

        if (alerta.status === "laranja") icone = "🟠";

        if (alerta.status === "amarelo") icone = "🟡";

        return `
            <p>
                ${icone}
                <strong>${alerta.nome}</strong><br>
                Lote: ${alerta.lote}
            </p>
        `;

    }).join("");

    console.log("Exibindo aviso de alerta.");

    chaveAtualPopup = chave;

    abrirModal(
         "⚠️ Atenção aos EPIs",

            `
            <p>
                Existem equipamentos que necessitam de acompanhamento.
            </p>

            <hr>

            <p>🔴 <strong>Vencidos:</strong> ${vencidos.length}</p>

            <p>🟠 <strong>Até 30 dias:</strong> ${proximos.length}</p>

            <p>🟡 <strong>Até 45 dias:</strong> ${preventivos.length}</p>

            <hr>

            <h3>Principais alertas</h3>

            ${listaPrincipais}

            ${
                data.alertas.length > 3
                    ? `<p><strong>...e mais ${data.alertas.length - 3} equipamentos.</strong></p>`
                    : ""
            }
            `
    );
    
    
}

function mostrarDetalhesEpi(id) {

    const epi = epiDashboard.find(e => e.id === id);

    if (!epi) return;

    abrirModal(

        epi.nome,

        `
        <p><strong>Lote:</strong> ${epi.lote}</p>

        <p><strong>Quantidade:</strong> ${epi.quantidade}</p>

        <p><strong>Descrição:</strong> ${epi.descricao || "-"}</p>

        <p><strong>Validade:</strong>

            ${
                epi.vencimento
                    ? new Date(epi.vencimento).toLocaleDateString("pt-BR")
                    : "-"
            }

        </p>
        `
    );

}

function abrirDetalhesAlerta(id) {

    const alerta = dashboardData.alertas.find(a => a.id === id);

    if (!alerta) return;

    let funcionarios = "";

    if (alerta.funcionarios.length === 0) {

        funcionarios = "<p>Nenhum funcionário recebeu este EPI.</p>";

    } else {

        funcionarios = `
            <ul>
                ${alerta.funcionarios.map(f => `
                    <li>
                        <strong>${f.nome}</strong><br>
                        Entregue em ${new Date(f.dataEntrega).toLocaleDateString("pt-BR")}
                    </li>
                `).join("")}
            </ul>
        `;
    }

    let statusTexto = "";

    if (alerta.diasParaVencer < 0) {
        statusTexto = `🔴 Vencido há ${Math.abs(alerta.diasParaVencer)} dias`;
    }
    else if (alerta.diasParaVencer <= 30) {
        statusTexto = `🟠 Vence em ${alerta.diasParaVencer} dias`;
    }
    else if (alerta.diasParaVencer <= 45) {
        statusTexto = `🟡 Vence em ${alerta.diasParaVencer} dias`;
    }
    else {
        statusTexto = `🟢 Vence em ${alerta.diasParaVencer} dias`;
    }

    abrirModal(
        alerta.nome,
        `
        <p><strong>Lote:</strong> ${alerta.lote}</p>

        <p><strong>Quantidade:</strong> ${alerta.quantidade}</p>

        <p><strong>Validade:</strong>
            ${new Date(alerta.vencimento).toLocaleDateString("pt-BR")}
        </p>

        <p><strong>Status:</strong> ${statusTexto}</p>

        <hr>

        <h3>Funcionários que receberam</h3>

        ${funcionarios}
        `
    );
}


async function loadDashboard() {

    try {

        const response = await fetch(`${API_URL}/dashboard/stats`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar dashboard");
        }

        const data = await response.json();
        epiDashboard = data.epis;

        dashboardData = data;
        verificarLembrete(data);

        // ==========================
        // Cards superiores
        // ==========================

        document.getElementById("totalEstoque").textContent =
            data.estoqueTotal;

        document.getElementById("verde").textContent =
            data.verde;

        document.getElementById("amarelo").textContent =
            data.amarelo;

        document.getElementById("laranja").textContent =
            data.laranja;

        document.getElementById("vermelho").textContent =
            data.vermelho;

        // ==========================
        // Lista de Alertas
        // ==========================

        const listaAlertas =
            document.getElementById("listaAlertas");

        if (data.alertas.length === 0) {

            listaAlertas.innerHTML = `
                <div class="alert-success">
                    Nenhum EPI necessita atenção.
                </div>
            `;

        } else {

            listaAlertas.innerHTML =
                data.alertas.map(alerta => {

                    let cor = "";

                    switch (alerta.status) {

                        case "vermelho":
                            cor = "red";
                            break;

                        case "laranja":
                            cor = "orange";
                            break;

                        case "amarelo":
                            cor = "yellow";
                            break;

                        default:
                            cor = "green";

                    }

                    const funcionarios =
                        alerta.funcionarios.length
                            ? alerta.funcionarios
                                .map(f => f.nome)
                                .join(", ")
                            : "Nenhum funcionário";

                    return `
                         <div
                            class="alert-card ${alerta.status}"
                            onclick="abrirDetalhesAlerta(${alerta.id})"
                        >

                            <h3>${alerta.nome}</h3>

                            <p>
                                <strong>Lote:</strong> ${alerta.lote}
                            </p>

                            <p>
                                <strong>Quantidade:</strong> ${alerta.quantidade}
                            </p>

                            <p>
                                <strong>Vencimento:</strong>
                                ${new Date(alerta.vencimento).toLocaleDateString("pt-BR")}
                            </p>

                            <p>
                                <strong>Funcionários:</strong>
                                ${funcionarios}
                            </p>

                        </div>
                    `;

                }).join("");

        }

        // ==========================
        // Lista de EPIs
        // ==========================

        const listaEpis =
            document.getElementById("listaEpis");

        listaEpis.innerHTML =
            data.epis.map(epi => {

                let status = "";

                if (epi.vencimento) {

                    const hoje = new Date();

                    const dias =
                        Math.ceil(
                            (new Date(epi.vencimento) - hoje)
                            /
                            (1000 * 60 * 60 * 24)
                        );

                    if (dias < 0)
                        status = "vermelho";

                    else if (dias <= 30)
                        status = "laranja";

                    else if (dias <= 45)
                        status = "amarelo";

                    else
                        status = "verde";

                }

                let icone = "🟢";

                if (status === "vermelho") icone = "🔴";
                if (status === "laranja") icone = "🟠";
                if (status === "amarelo") icone = "🟡";

                return `

                     <div class="epi-card ${status}" onclick="mostrarDetalhesEpi(${epi.id})">

                        <div>

                            <strong>${icone} ${epi.nome}</strong><br>

                            <small>Lote ${epi.lote}</small>

                        </div>

                        <div>

                            <strong>${epi.quantidade}</strong>

                        </div>

                    </div>

                `;

            }).join("");

    }

    catch (error) {

        console.error(error);

    }

}

// ==========================
// BOTÕES
// ==========================

function setupQuickActions() {

    const botoes = document.querySelectorAll(".btn");

    if (botoes[0]) {

        botoes[0].onclick = () => {

            window.location.href =
                "entregas.html";

        };

    }

    if (botoes[1]) {

        botoes[1].onclick = () => {

            window.location.href =
                "epis.html";

        };

    }

    if (botoes[2]) {

        botoes[2].onclick = () => {

            window.location.href =
                "relatorios.html";

        };

    }

}

// ==========================
// INICIALIZAÇÃO
// ==========================

async function init() {

    document
    .getElementById("closeModal")
    .addEventListener("click", fecharModal);

    document
    .getElementById("modalOverlay")
    .addEventListener("click", (e) => {

        if (e.target.id === "modalOverlay") {

            fecharModal();

        }

    });

    setupQuickActions();

    await loadDashboard();

    // Atualiza automaticamente
    setInterval(loadDashboard, 30000);

}

init();