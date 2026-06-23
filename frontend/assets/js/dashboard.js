const token = localStorage.getItem("token");

// Verificar se está logado
if (!token) {
    window.location.href = "index.html";
}

// Carregar dados do usuário
async function loadUserInfo() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();

            const userNameElement = document.getElementById("userName");
            const userRoleElement = document.getElementById("userRole");
            const profileBtn = document.getElementById("profileBtn");

            if (userNameElement) {
                userNameElement.textContent = user.name;
            }

            if (userRoleElement) {
                userRoleElement.textContent = user.role || "Administrador";
            }

            if (profileBtn && user.name) {
                profileBtn.textContent = user.name.charAt(0).toUpperCase();
            }

        } else if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        }

    } catch (error) {
        console.error("Erro ao carregar usuário:", error);
    }
}

// Carregar dashboard
async function loadDashboardStats() {
    try {

        const response = await fetch(`${API_URL}/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar dashboard");
        }

        const data = await response.json();

        // A quantidade de funcionários
        document.getElementById("totalFuncionarios").textContent =
            data.totalFuncionarios;

        // A quantidade de EPIs em estoque
        document.getElementById("listaEpis").innerHTML =
            data.epis.length
                ? data.epis.map(epi =>
                    `
                    <div class="epi-card estoque">
                        <span>${epi.nome}</span>
                        <strong>${epi.quantidade} un.</strong>
                    </div>
                    `
                ).join("")
                : "<div>Nenhum EPI cadastrado</div>";

        // Os EPIs próximos do vencimento
        document.getElementById("listaProximos").innerHTML =
            data.proximosVencimento.length
                ? data.proximosVencimento.map(epi => {
                    const dataFormatada =
                        new Date(epi.vencimento).toLocaleDateString("pt-BR");

                    return `
                        <div class="item-vencimento proximo">
                            ${epi.nome}<br>
                            <small>Vence em: ${dataFormatada}</small>
                        </div>
                    `;
                }).join("")
                : "<div>Nenhum EPI próximo do vencimento</div>";

        // Os EPIs vencidos
        document.getElementById("listaVencidos").innerHTML =
            data.vencidos.length
                ? data.vencidos.map(epi => {
                    const dataFormatada =
                        new Date(epi.vencimento).toLocaleDateString("pt-BR");

                    return `
                        <div class="item-vencimento vencido">
                            ${epi.nome}<br>
                            <small>Venceu em: ${dataFormatada}</small>
                        </div>
                    `;
                }).join("")
                : "<div>Nenhum EPI vencido</div>";

    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }
}

// Configurar ações rápidas
function setupQuickActions() {

    const botoes = document.querySelectorAll(".btn");

    if (botoes[0]) {
        botoes[0].addEventListener("click", () => {
            window.location.href = "entregas.html";
        });
    }

    if (botoes[1]) {
        botoes[1].addEventListener("click", () => {
            window.location.href = "epis.html";
        });
    }

    if (botoes[2]) {
        botoes[2].addEventListener("click", () => {
            window.location.href = "relatorios.html";
        });
    }
}

// Inicialização
async function init() {
    await loadUserInfo();
    await loadDashboardStats();
    setupQuickActions();

    // Atualiza a cada 30 segundos
    setInterval(loadDashboardStats, 30000);
}

init();