
// USUÁRIO GLOBAL (IMPORTANTE)

window.currentUser = null



// HEADER

async function initializeHeader() {
    const token = localStorage.getItem("token")

    if (!token) return

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) return

        const user = await response.json()

        // 🔥 SALVA GLOBALMENTE
        window.currentUser = user
        localStorage.setItem("user", JSON.stringify(user))

        const userNameElement = document.getElementById('userName')
        const userRoleElement = document.getElementById('userRole')
        const profileBtn = document.getElementById('profileBtn')

        if (userNameElement) {
            userNameElement.textContent = user.name
        }

        if (userRoleElement) {
            userRoleElement.textContent = user.role || 'Usuário'
        }

        if (profileBtn && user.name) {
            profileBtn.textContent = user.name.charAt(0).toUpperCase()
        }

        // APLICAR PERMISSÕES GLOBAIS
        aplicarPermissoesGlobais()

    } catch (error) {
        console.error('Erro ao carregar usuário:', error)
    }
}



// PERMISSÕES GLOBAIS MENU

function aplicarPermissoesGlobais() {
    const user = window.currentUser || JSON.parse(localStorage.getItem("user"))

    if (!user) return

    // NAV ITEMS
    const navFuncionarios = document.querySelector('a[href="funcionarios.html"]')
    const navEpis = document.querySelector('a[href="epis.html"]')
    const navRelatorios = document.querySelector('a[href="relatorios.html]')

    // FUNCIONÁRIO não vê menus administrativos
    if (user.role === "FUNCIONARIO") {
        if (navFuncionarios) navFuncionarios.style.display = "none"
        if (navEpis) navEpis.style.display = "none"
        if (navRelatorios) navRelatorios.style.display = "none"
    }

   
}



// DROPDOWNS

function setupDropdowns() {
    const profileBtn = document.getElementById('profileBtn')
    const profileDropdown = document.getElementById('profileDropdown')
    const settingsBtn = document.getElementById('settingsBtn')
    const settingsDropdown = document.getElementById('settingsDropdown')
    const logoutLink = document.querySelector('.logout-link')

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            profileDropdown.classList.toggle('show')
            settingsDropdown?.classList.remove('show')
        })
    }

    if (settingsBtn && settingsDropdown) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            settingsDropdown.classList.toggle('show')
            profileDropdown?.classList.remove('show')
        })
    }

    document.addEventListener('click', () => {
        profileDropdown?.classList.remove('show')
        settingsDropdown?.classList.remove('show')
    })

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault()
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = 'login.html'
        })
    }
}



// INIT

document.addEventListener('DOMContentLoaded', () => {
    initializeHeader()
    setupDropdowns()
})