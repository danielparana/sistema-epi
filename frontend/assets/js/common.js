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
    const logoutLink = document.querySelector('.logout-link');

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
// 5. OTIMIZAÇÃO DE CONVERSÃO E SUPORTE (UX/UI)
// ==========================================
function injectUXImprovements() {
    // Evita injetar na tela de login/index
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('index.html')) return;

    // 1. INJEÇÃO DO BOTÃO DE VENDAS (HEADER)
    const headerActions = document.querySelector('header .flex.items-center.justify-between');
    
    if (headerActions && !document.getElementById('btnUpgrade')) {
        const upgradeBtnHTML = `
            <!-- Versão Desktop: Botão Persuasivo -->
            <a href="https://forms.gle/L5P39g6hALqYKnFp9" id="btnUpgrade" class="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-green-400/30 mr-2 md:mr-4">
                <i class="fa-solid fa-crown text-yellow-300"></i>
                <span>Fazer Upgrade</span>
            </a>
            
            <!-- Versão Mobile: Ícone de Destaque com Animação -->
            <a href="https://forms.gle/L5P39g6hALqYKnFp9" class="flex sm:hidden items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-md mr-1 animate-[pulse_2s_ease-in-out_infinite] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                <i class="fa-solid fa-crown text-yellow-300"></i>
            </a>
        `;
        
        headerActions.insertAdjacentHTML('afterbegin', upgradeBtnHTML);
    }

    // 2. INJEÇÃO DO BOTÃO DE SUPORTE (FLOATING ACTION BUTTON)
    if (!document.getElementById('supportFab')) {
        const supportFabHTML = `
            <button id="supportFab" onclick="abrirFormularioDuvidas()" class="fixed right-4 bottom-[90px] md:right-8 md:bottom-8 z-50 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-[0_8px_30px_rgb(13,84,180,0.3)] flex items-center justify-center text-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-500/30 group">
                <i class="fa-regular fa-comment-dots transition-opacity duration-300 group-hover:opacity-0 absolute"></i>
                <i class="fa-solid fa-headset transition-opacity duration-300 opacity-0 group-hover:opacity-100 absolute"></i>
                
                <span class="absolute right-16 bg-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden md:block shadow-lg">
                    Dúvidas ou Sugestões?
                    <svg class="absolute text-slate-800 h-2 w-full left-0 top-1/2 -translate-y-1/2 -right-[5px] translate-x-full" x="0px" y="0px" viewBox="0 0 255 255" xml:space="preserve"><polygon class="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </span>
            </button>
        `;
        document.body.insertAdjacentHTML('beforeend', supportFabHTML);
    }
}

// Função placeholder para o modal de dúvidas
window.abrirFormularioDuvidas = function() {
    window.open('https://forms.gle/zE6dLz45uq7Wp8TJ8', '_blank');
};

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
    // 4º: Injeta as melhorias de UX/UI focadas em conversão e retenção
    injectUXImprovements();
}); 