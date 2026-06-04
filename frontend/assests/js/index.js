document.addEventListener("DOMContentLoaded", () => {
    const demoButton = document.querySelector(".btn-secondary");

    if (demoButton) {
        demoButton.addEventListener("click", () => {
            alert("Funcionalidade em desenvolvimento.");
        });
    }
});