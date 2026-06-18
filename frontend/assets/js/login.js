const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {

            message.style.color = "red";
            message.textContent =
                data.message ||
                data.error ||
                "Erro ao realizar login";

            return;
        }

        localStorage.setItem("token", data.token);

        message.style.color = "green";
        message.textContent = "Login realizado com sucesso";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);

    } catch (error) {

        console.error(error);

        message.style.color = "red";
        message.textContent =
            "Não foi possível conectar ao servidor";

    }
});