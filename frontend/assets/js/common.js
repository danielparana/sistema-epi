// USUÁRIO GLOBAL
window.currentUser = null;

// ==========================================
// 1. MOTOR DE NAVEGAÇÃO DINÂMICA
// ==========================================
function injectNavigation() {
    // Evita injetar na tela de login
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('index.html')) return;

    // Lista centralizada das rotas do sistema
    const navItems = [
        { name: 'Dashboard', url: 'dashboard.html', icon: 'fa-chart-pie' },
        { name: 'Funcionários', url: 'funcionarios.html', icon: 'fa-users' },
        { name: 'EPIs', url: 'epis.html', icon: 'fa-helmet-safety' },
        { name: 'Entregas', url: 'entregas.html', icon: 'fa-box-open' },
        { name: 'Relatórios', url: 'relatorios.html', icon: 'fa-file-lines' }
    ];

    // Identifica em qual página estamos agora
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

    // Monta o HTML da navegação mapeando o array
    const navItemsHTML = navItems.map(item => {
        const isActive = currentPath === item.url;
        
        // Classes dinâmicas baseadas no estado (Ativo/Inativo)
        const colorClasses = isActive 
            ? 'text-brand-600 md:text-brand-500 border-brand-500' 
            : 'text-slate-500 hover:text-brand-600 border-transparent';
        
        const ariaCurrent = isActive ? 'aria-current="page"' : '';

        return `
            <a href="${item.url}" class="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 w-full md:w-auto font-medium md:py-4 md:border-b-2 transition-colors ${colorClasses}" ${ariaCurrent}>
                <i class="fa-solid ${item.icon} text-[22px] md:text-base"></i>
                <span class="text-[10px] md:text-sm">${item.name}</span>
            </a>
        `;
    }).join('');

    // Estrutura do contêiner da Bottom Bar (Mobile) / Top Bar (Desktop)
    const navContainer = `
        <div id="mainNavigation" class="fixed bottom-0 left-0 z-40 w-full h-[72px] bg-white border-t border-slate-200 md:relative md:h-auto md:border-t-0 md:border-b md:block">
            <nav class="h-full max-w-7xl mx-auto flex justify-around md:justify-center md:gap-8 px-2 md:px-6">
                ${navItemsHTML}
            </nav>
        </div>
    `;

    // Injeta imediatamente após o <header>
    const header = document.querySelector('header');
    if (header) {
        header.insertAdjacentHTML('afterend', navContainer);
    }
}

// ==========================================
// 2. INICIALIZAÇÃO DE SESSÃO
// ==========================================
async function initializeHeader() {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return;

        const user = await response.json();

        // SALVA GLOBALMENTE
        window.currentUser = user;
        localStorage.setItem("user", JSON.stringify(user));

        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        const profileBtn = document.getElementById('profileBtn');

        if (userNameElement) userNameElement.textContent = user.name;
        if (userRoleElement) userRoleElement.textContent = user.role || 'Usuário';
        if (profileBtn && user.name) profileBtn.textContent = user.name.charAt(0).toUpperCase();

        // APLICA PERMISSÕES DEPOIS DE INJETAR O MENU
        aplicarPermissoesGlobais();

    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
    }
}

// ==========================================
// 3. CONTROLE DE ACESSO
// ==========================================
function aplicarPermissoesGlobais() {
    const user = window.currentUser || JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    // Busca os itens no DOM (Agora eles já existem graças à injeção dinâmica)
    const navFuncionarios = document.querySelector('a[href="funcionarios.html"]');
    const navEpis = document.querySelector('a[href="epis.html"]');
    const navRelatorios = document.querySelector('a[href="relatorios.html"]');

    // REGRA DE NEGÓCIO: Funcionário operacional não possui acesso administrativo
    if (user.role === "FUNCIONARIO") {
        if (navFuncionarios) navFuncionarios.style.display = "none";
        if (navEpis) navEpis.style.display = "none";
        if (navRelatorios) navRelatorios.style.display = "none";
    }
}

// ==========================================
// 4. INTERAÇÕES E DROPDOWNS (Tailwind Fix)
// ==========================================
function setupDropdowns() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsDropdown = document.getElementById('settingsDropdown');
    const logoutLink = document.getElementById('logoutBtn');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
            if (settingsDropdown) settingsDropdown.classList.add('hidden');
        });
    }

    if (settingsBtn && settingsDropdown) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsDropdown.classList.toggle('hidden');
            if (profileDropdown) profileDropdown.classList.add('hidden');
        });
    }

    // Fecha ao clicar fora
    document.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.add('hidden');
        if (settingsDropdown) settingsDropdown.classList.add('hidden');
    });

    // Logout Seguro
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
}

// ==========================================
// BOOTSTRAP DO SISTEMA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1º: Monta a estrutura da tela
    injectNavigation(); 
    // 2º: Conecta com banco e aplica restrições
    initializeHeader(); 
    // 3º: Libera interações de clique
    setupDropdowns();   
});