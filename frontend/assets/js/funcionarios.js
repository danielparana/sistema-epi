const employeeForm = document.getElementById("employeeForm");
const employeeTable = document.getElementById("employeeTable");
const cpfInput = document.getElementById("cpf");
const cpfError = document.getElementById("cpfError");

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) {
        return false;
    }
    
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

cpfInput.addEventListener('blur', () => {
    const cpf = cpfInput.value.trim();
    if (cpf && !validarCPF(cpf)) {
        cpfError.textContent = 'CPF inválido';
        cpfError.style.display = 'block';
    } else {
        cpfError.style.display = 'none';
    }
});

async function carregarFuncionarios() {
    const token = localStorage.getItem('token')

    if (!token) {
        window.location.href = 'login.html'
        return
    }

    try {
        const response = await fetch(`${API_URL}/employees`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            localStorage.removeItem('token')
            window.location.href = 'login.html'
            return
        }

        const funcionarios = await response.json()

        employeeTable.innerHTML = ''

        funcionarios.forEach(funcionario => {
            employeeTable.innerHTML += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${funcionario.id}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${funcionario.nome}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${funcionario.cpf}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${funcionario.cargo}</td>
                </tr>
            `
        })
    } catch (error) {
        console.error(error)
    }
}

employeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const cargo = document.getElementById("cargo").value;

    if (!validarCPF(cpf)) {
        cpfError.textContent = 'CPF inválido';
        cpfError.style.display = 'block';
        return;
    }

    try {
        const token = localStorage.getItem('token')

        if (!token) {
            window.location.href = 'login.html'
            return
        }

        const response = await fetch(`${API_URL}/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                nome,
                cpf,
                cargo
            })
        })

        if (!response.ok) {
            const erro = await response.json()

            if (erro.error === "CPFf já cadastrado") {
                alert("Já existe um funcionário cadastrado com esse CPF.")
                return
            }
            throw new Error(erro.error || "Erro ao cadastrar")
        }

        employeeForm.reset();
        cpfError.style.display = 'none';
        carregarFuncionarios();
        alert("Funcionário cadastrado com sucesso!");

    } catch (error) {
        console.error(error);
        alert("Erro ao cadastrar funcionário: " + error.message);
    }
});

carregarFuncionarios();