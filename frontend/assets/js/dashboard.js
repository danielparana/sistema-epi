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