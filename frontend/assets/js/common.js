// Função comum para inicializar o header em todas as páginas
async function initializeHeader() {
    const token = localStorage.getItem("token")

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (response.ok) {
            const user = await response.json()

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
                const firstLetter = user.name.charAt(0).toUpperCase()
                profileBtn.textContent = firstLetter
            }
        }
    } catch (error) {
        console.error('Erro ao carregar usuário:', error)
    }
}

// Handlers para dropdowns
function setupDropdowns() {
    const profileBtn = document.getElementById('profileBtn')
    const profileDropdown = document.getElementById('profileDropdown')
    const settingsBtn = document.getElementById('settingsBtn')
    const settingsDropdown = document.getElementById('settingsDropdown')
    const logoutLink = document.querySelector('.logout-link')

    // Toggle profile dropdown
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            profileDropdown.classList.toggle('show')
            if (settingsDropdown) {
                settingsDropdown.classList.remove('show')
            }
        })
    }

    // Toggle settings dropdown
    if (settingsBtn && settingsDropdown) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            settingsDropdown.classList.toggle('show')
            if (profileDropdown) {
                profileDropdown.classList.remove('show')
            }
        })
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        if (profileDropdown) {
            profileDropdown.classList.remove('show')
        }
        if (settingsDropdown) {
            settingsDropdown.classList.remove('show')
        }
    })

    // Handle logout
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault()
            localStorage.removeItem('token')
            window.location.href = 'login.html'
        })
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initializeHeader()
    setupDropdowns()
})
