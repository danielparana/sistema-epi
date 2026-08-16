const token = localStorage.getItem("token");

// Verifica login
if (!token) {
    window.location.href = "login.html";
}

let epiDashboard = [];
let dashboardData = null;

let chaveAtualPopup = null;


// ==========================
// FORMATAÇÃO DE DATAS
// ==========================

function formatDateISOtoBR(isoString) {

    if (!isoString) return "-";

    const [ano, mes, dia] =
        isoString.split("T")[0].split("-");

    return `${dia}/${mes}/${ano}`;
}


function daysDiffUTC(dateStr1, dateStr2) {

    const d1 = new Date(
        dateStr1.split("T")[0] + "T00:00:00.000Z"
    );

    const d2 = new Date(
        dateStr2.split("T")[0] + "T00:00:00.000Z"
    );

    return Math.round(
        (d2 - d1) /
        (1000 * 60 * 60 * 24)
    );
}


// ==========================
// MODAL
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

        localStorage.setItem(
            chaveAtualPopup,
            "visualizado"
        );

    }

}


// ==========================
// LEMBRETES / POPUP
// ==========================

function verificarLembrete(data) {

    // Sem alertas, não mostra popup
    if (data.alertas.length === 0) {
        return;
    }

    const agora = new Date();

    const hora = agora.getHours();
    const minuto = agora.getMinutes();

    let periodo = null;

    // Das 8h às 11:39
    if (
        hora >= 8 &&
        hora < 11 ||
        (hora === 11 && minuto < 40)
    ) {

        periodo = "08";

    }

    // Das 11:40 às 16:59
    else if (
        (hora === 11 && minuto >= 40) ||
        (hora > 11 && hora < 17)
    ) {

        periodo = "1140";

    }

    // Das 17h em diante
    else if (hora >= 17) {

        periodo = "1700";

    }

    if (!periodo) {
        return;
    }

    const ano = agora.getFullYear();

    const mes = String(
        agora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        agora.getDate()
    ).padStart(2, "0");

    const dataAtual =
        `${ano}-${mes}-${dia}`;

    const chave =
        `popup_${dataAtual}_${periodo}`;

    console.log("Chave:", chave);

    const popupExibido =
        localStorage.getItem(chave);

    if (popupExibido) {

        console.log(
            "Aviso já exibido período."
        );

        return;
    }

    const vencidos =
        data.alertas.filter(
            a => a.status === "vermelho"
        );

    const proximos =
        data.alertas.filter(
            a => a.status === "laranja"
        );

    const preventivos =
        data.alertas.filter(
            a => a.status === "amarelo"
        );

    const principais =
        data.alertas.slice(0, 3);

    const listaPrincipais =
        principais.map(alerta => {

            let icone = "🟢";

            if (alerta.status === "vermelho")
                icone = "🔴";

            if (alerta.status === "laranja")
                icone = "🟠";

            if (alerta.status === "amarelo")
                icone = "🟡";

            return `
                <p>
                    ${icone}
                    <strong>${alerta.nome}</strong><br>
                    Lote: ${alerta.lote}
                </p>
            `;

        }).join("");

    console.log(
        "Exibindo aviso de alerta."
    );

    chaveAtualPopup = chave;

    abrirModal(

        "⚠️ Atenção aos EPIs",

        `
        <p>
            Existem equipamentos que necessitam
            de acompanhamento.
        </p>

        <hr>

        <p>
            🔴 <strong>Vencidos:</strong>
            ${vencidos.length}
        </p>

        <p>
            🟠 <strong>Até 30 dias:</strong>
            ${proximos.length}
        </p>

        <p>
            🟡 <strong>Até 45 dias:</strong>
            ${preventivos.length}
        </p>

        <hr>

        <h3>Principais alertas</h3>

        ${listaPrincipais}

        ${
            data.alertas.length > 3
                ? `
                    <p>
                        <strong>
                            ...e mais
                            ${data.alertas.length - 3}
                            equipamentos.
                        </strong>
                    </p>
                  `
                : ""
        }
        `
    );
}


// ==========================
// DETALHES DO EPI
// ==========================

function mostrarDetalhesEpi(id) {

    const epi =
        epiDashboard.find(e => e.id === id);

    if (!epi) return;

    abrirModal(

        epi.nome,

        `
        <p>
            <strong>Lote:</strong>
            ${epi.lote}
        </p>

        <p>
            <strong>Quantidade:</strong>
            ${epi.quantidade}
        </p>

        <p>
            <strong>Descrição:</strong>
            ${epi.descricao || "-"}
        </p>

        <p>
            <strong>Validade:</strong>
            ${
                epi.vencimento
                    ? formatDateISOtoBR(epi.vencimento)
                    : "-"
            }
        </p>
        `
    );
}


// ==========================
// DETALHES DO ALERTA
// ==========================

function abrirDetalhesAlerta(id) {

    const alerta =
        dashboardData.alertas.find(
            a => a.id === id
        );

    if (!alerta) return;

    let funcionarios = "";

    if (alerta.funcionarios.length === 0) {

        funcionarios =
            "<p>Nenhum funcionário recebeu este EPI.</p>";

    } else {

        funcionarios = `
            <ul class="space-y-3">

                ${alerta.funcionarios.map(f => `

                    <li class="border-b-2 border-gray-200 pb-3">

                        <strong>Funcionário:</strong>
                        ${f.nome}
                        <br>

                        <strong>Matrícula:</strong>
                        ${f.id}
                        <br>

                        <strong>Entrega:</strong>
                        ${
                            f.dataEntrega
                                ? formatDateISOtoBR(
                                    f.dataEntrega
                                  )
                                : "-"
                        }

                    </li>

                `).join("")}

            </ul>
        `;
    }

    let statusTexto = "";

    if (alerta.diasParaVencer < 0) {

        statusTexto =
            `🔴 Vencido há ${
                Math.abs(alerta.diasParaVencer)
            } dias`;

    }

    else if (alerta.diasParaVencer <= 30) {

        statusTexto =
            `🟠 Vence em ${
                alerta.diasParaVencer
            } dias`;

    }

    else if (alerta.diasParaVencer <= 45) {

        statusTexto =
            `🟡 Vence em ${
                alerta.diasParaVencer
            } dias`;

    }

    else {

        statusTexto =
            `🟢 Vence em ${
                alerta.diasParaVencer
            } dias`;

    }

    abrirModal(

        alerta.nome,

        `
        <p>
            <strong>Lote:</strong>
            ${alerta.lote}
        </p>

        <p>
            <strong>Quantidade:</strong>
            ${alerta.quantidade}
        </p>

        <p>
            <strong>Validade:</strong>
            ${
                alerta.vencimento
                    ? formatDateISOtoBR(
                        alerta.vencimento
                      )
                    : "-"
            }
        </p>

        <p>
            <strong>Status:</strong>
            ${statusTexto}
        </p>

        <hr>

        <h3>Funcionários que receberam</h3>

        ${funcionarios}
        `
    );
}


// ==========================
// CARREGA DASHBOARD
// ==========================

async function loadDashboard() {

    try {

        const response =
            await fetch(
                `${API_URL}/dashboard/stats`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                "Erro ao carregar dashboard"
            );

        }

        const data =
            await response.json();

        epiDashboard = data.epis;

        dashboardData = data;

        verificarLembrete(data);


        // ==========================
        // CARDS SUPERIORES
        // ==========================

        document.getElementById(
            "totalEstoque"
        ).textContent =
            data.estoqueTotal;

        document.getElementById(
            "verde"
        ).textContent =
            data.verde;

        document.getElementById(
            "amarelo"
        ).textContent =
            data.amarelo;

        document.getElementById(
            "laranja"
        ).textContent =
            data.laranja;

        document.getElementById(
            "vermelho"
        ).textContent =
            data.vermelho;


        // ==========================
        // LISTA DE ALERTAS
        // ==========================

        const listaAlertas =
            document.getElementById(
                "listaAlertas"
            );

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
                    let icone = "";

                    switch (alerta.status) {

                        case "vermelho":

                            cor =
                                "border-red-500 bg-red-50";

                            icone = "🔴";

                            break;

                        case "laranja":

                            cor =
                                "border-orange-500 bg-orange-50";

                            icone = "🟠";

                            break;

                        case "amarelo":

                            cor =
                                "border-yellow-500 bg-yellow-50";

                            icone = "🟡";

                            break;

                        default:

                            cor =
                                "border-green-500 bg-green-50";

                            icone = "🟢";
                    }

                    const funcionarios =
                        alerta.funcionarios.length
                            ? alerta.funcionarios
                                .map(f => f.nome)
                                .join(", ")
                            : "Nenhum funcionário";

                    return `

                        <div
                            onclick="abrirDetalhesAlerta(${alerta.id})"
                            class="
                                cursor-pointer
                                rounded-lg
                                border-l-4
                                ${cor}
                                p-4
                                hover:shadow-md
                                transition-all
                            "
                        >

                            <div
                                class="
                                    flex
                                    justify-between
                                    items-start
                                "
                            >

                                <div>

                                    <h3
                                        class="
                                            font-semibold
                                            text-slate-800
                                        "
                                    >
                                        ${icone}
                                        ${alerta.nome}
                                    </h3>

                                    <p
                                        class="
                                            text-sm
                                            text-slate-600
                                        "
                                    >
                                        Lote ${alerta.lote}
                                    </p>

                                </div>

                            </div>

                            <div
                                class="
                                    mt-3
                                    text-sm
                                    text-slate-600
                                "
                            >

                                <p>
                                    <strong>
                                        Quantidade:
                                    </strong>

                                    ${alerta.quantidade}
                                </p>

                                <p>
                                    <strong>
                                        Validade:
                                    </strong>

                                    ${
                                        alerta.vencimento
                                            ? formatDateISOtoBR(
                                                alerta.vencimento
                                              )
                                            : "-"
                                    }
                                </p>

                            </div>

                        </div>

                    `;

                }).join("");

        }


        // ==========================
        // LISTA DE EPIs
        // ==========================

        const listaEpis =
            document.getElementById(
                "listaEpis"
            );

        listaEpis.innerHTML =
            data.epis.map(epi => {

                let status = "";

                if (epi.vencimento) {

                    const hojeStr =
                        new Date()
                            .toISOString()
                            .split("T")[0];

                    const vencimentoStr =
                        epi.vencimento
                            .split("T")[0];

                    const dias =
                        daysDiffUTC(
                            hojeStr,
                            vencimentoStr
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

                if (status === "vermelho")
                    icone = "🔴";

                if (status === "laranja")
                    icone = "🟠";

                if (status === "amarelo")
                    icone = "🟡";


                return `

                    <div
                        onclick="mostrarDetalhesEpi(${epi.id})"
                        class="
                            bg-white
                            border
                            border-slate-200
                            rounded-xl
                            p-4
                            cursor-pointer
                            hover:shadow-lg
                            hover:-translate-y-1
                            transition-all
                            duration-200
                        "
                    >

                        <div
                            class="
                                flex
                                justify-between
                                items-start
                            "
                        >

                            <div>

                                <h3
                                    class="
                                        font-semibold
                                        text-slate-800
                                    "
                                >
                                    ${icone}
                                    ${epi.nome}
                                </h3>

                                <p
                                    class="
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    Lote ${epi.lote}
                                </p>

                            </div>

                            <i
                                class="
                                    fa-solid
                                    fa-chevron-right
                                    text-slate-400
                                "
                            ></i>

                        </div>


                        <div
                            class="
                                mt-4
                                grid
                                grid-cols-2
                                gap-4
                            "
                        >

                            <div>

                                <p
                                    class="
                                        text-xs
                                        uppercase
                                        text-slate-400
                                    "
                                >
                                    Validade
                                </p>

                                <p
                                    class="
                                        font-medium
                                    "
                                >

                                    ${
                                        epi.vencimento
                                            ? formatDateISOtoBR(
                                                epi.vencimento
                                              )
                                            : "-"
                                    }

                                </p>

                            </div>


                            <div>

                                <p
                                    class="
                                        text-xs
                                        uppercase
                                        text-slate-400
                                    "
                                >
                                    Estoque
                                </p>

                                <p
                                    class="
                                        font-bold
                                        text-lg
                                    "
                                >
                                    ${epi.quantidade}
                                </p>

                            </div>

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

    const botoes =
        document.querySelectorAll(".btn");

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
        .addEventListener(
            "click",
            fecharModal
        );

    document
        .getElementById("modalOverlay")
        .addEventListener(
            "click",
            (e) => {

                if (
                    e.target.id ===
                    "modalOverlay"
                ) {

                    fecharModal();

                }

            }
        );

    setupQuickActions();

    await loadDashboard();

    // Atualiza automaticamente
    setInterval(
        loadDashboard,
        30000
    );

}

init();