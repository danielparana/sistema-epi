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
            const userNameElement = document.getElementById('userName');
            const userRoleElement = document.getElementById('userRole');

            if (userNameElement) {
                userNameElement.textContent = user.name;
            }

            if (userRoleElement) {
                userRoleElement.textContent = user.role || 'Administrador';
            }
        } else if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
    }
}

// Carregar estatísticas do dashboard
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Atualizar os cards
            document.getElementById('totalEpis').textContent = data.estoque;
            document.getElementById('totalFuncionarios').textContent = data.funcionarios;
            document.getElementById('proximosVencimento').textContent = data.proximosVencimento;
            document.getElementById('vencidos').textContent = data.vencidos;
            
            // Atualizar alertas
            updateAlerts(data.alertas);
        } else if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = "index.html";
        } else {
            console.error('Erro ao carregar estatísticas');
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}


function updateAlerts(alertas) {
    const alertList = document.querySelector('.alert-list');
    
    if (!alertList) return;
    
    alertList.innerHTML = alertas.map(alerta => {
        let dotClass = 'yellow-dot';
        if (alerta.tipo === 'danger') dotClass = 'red-dot';
        else if (alerta.tipo === 'info') dotClass = 'green-dot';
        
        return `
            <div class="alert-item">
                <span class="status-dot ${dotClass}"></span>
                <p class="alert-text">${alerta.texto}</p>
            </div>
        `;
    }).join('');
}


function setupQuickActions() {
    const btnRegistrarEntrega = document.querySelector('.btn-primary');
    const btnCadastrarEPI = document.querySelectorAll('.btn-secondary')[0];
    const btnVerRelatorios = document.querySelectorAll('.btn-secondary')[1];
    
    if (btnRegistrarEntrega) {
        btnRegistrarEntrega.addEventListener('click', () => {
            window.location.href = 'entregas.html';
        });
    }
    
    if (btnCadastrarEPI) {
        btnCadastrarEPI.addEventListener('click', () => {
            window.location.href = 'epis.html';
        });
    }
    
    if (btnVerRelatorios) {
        btnVerRelatorios.addEventListener('click', () => {
            window.location.href = 'relatorios.html';
        });
    }
}


async function init() {
    await loadUserInfo();
    await loadDashboardStats();
    setupQuickActions();
    
    
    setInterval(loadDashboardStats, 30000);
}

// Executar inicialização
init();