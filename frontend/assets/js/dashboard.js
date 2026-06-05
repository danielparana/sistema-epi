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

        if (userNameElement) {
            userNameElement.textContent = user.name
        }

        if (userRoleElement) {
            userRoleElement.textContent = user.role || 'Usuário'
        }
    }
} catch (error) {
    console.error('Erro ao carregar usuário:', error)
}