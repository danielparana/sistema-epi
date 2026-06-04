document.addEventListener("DOMContentLoaded", async () => {

    try {

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const response = await fetch(
            `${API_URL}/dashboard`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        document.getElementById("totalEpis").textContent =
            data.totalEpis || 0;

        document.getElementById("totalFuncionarios").textContent =
            data.totalFuncionarios || 0;

        document.getElementById("proximosVencimento").textContent =
            data.proximosVencimento || 0;

        document.getElementById("vencidos").textContent =
            data.vencidos || 0;

    } catch (error) {
        console.error(error);
    }

});