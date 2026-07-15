const employeeForm = document.getElementById("employeeForm");
const employeeTable = document.getElementById("employeeTable");
const cpfInput = document.getElementById("cpf");
const cpfError = document.getElementById("cpfError")


let editingEmployeeId = null;

// CPF

function validarCPF(cpf) {

    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11) return false;

    if (
        cpf === "00000000000" ||
        cpf === "11111111111" ||
        cpf === "22222222222" ||
        cpf === "33333333333" ||
        cpf === "44444444444" ||
        cpf === "55555555555" ||
        cpf === "66666666666" ||
        cpf === "77777777777" ||
        cpf === "88888888888" ||
        cpf === "99999999999"
    ) {
        return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }

    let resto = 11 - (soma % 11);

    if (resto >= 10) resto = 0;

    if (resto !== parseInt(cpf.charAt(9))) {
        return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }

    resto = 11 - (soma % 11);

    if (resto >= 10) resto = 0;

    if (resto !== parseInt(cpf.charAt(10))) {
        return false;
    }

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

// Carregar funcionarios

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
                <td style="padding:10px;">${funcionario.id}</td>

                <td style="padding:10px;">
                    ${funcionario.nome}
                </td>

                <td style="padding:10px;">
                    ${funcionario.cpf}
                </td>

                <td style="padding:10px;">
                    ${funcionario.cargo}
                </td>

                <td style="padding:10px; text-align:center;">

                    <button
                        class="btn-edit"
                        onclick="editarFuncionario(${funcionario.id})">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="btn-delete"
                        onclick="desativarFuncionario(${funcionario.id})">

                        <i class="fa-solid fa-user-slash"></i>

                    </button>

                </td>

            </tr>
            `
        })

        aplicarPermissoes()

    } catch (error) {
        console.error(error)
    }


}

// Editar funcionarios

function editarFuncionario(id) {

    const funcionario = [...employeeTable.rows]
        .find(row => Number(row.cells[0].textContent) === id)

    if (!funcionario) return

    document.getElementById("nome").value = funcionario.cells[1].textContent.trim()
    document.getElementById("cpf").value = funcionario.cells[2].textContent.trim()
    document.getElementById("cargo").value = funcionario.cells[3].textContent.trim()

    editingEmployeeId = id

    employeeForm.querySelector("button").textContent = "Salvar Alterações"
}

// Salvar funcionario

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

        const url = editingEmployeeId
            ? `${API_URL}/employees/${editingEmployeeId}`
            : `${API_URL}/employees`

        const method = editingEmployeeId
            ? 'PUT'
            : 'POST'

        const response = await fetch(url, {
            method,
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

            if (erro.error === "CPF já cadastrado") {
                alert("Já existe um funcionário cadastrado com esse CPF.")
                return
            }
            throw new Error(erro.error || "Erro ao cadastrar")
        }

        employeeForm.reset();
        cpfError.style.display = 'none';
        editingEmployeeId = null;
        employeeForm.querySelector("button").textContent =
            "Cadastrar Funcionário";

        carregarFuncionarios();

        alert(
            method === 'POST'
                ? "Funcionário cadastrado com sucesso!"
                : "Funcionário atualizado com sucesso!"
        );

    } catch (error) {
        console.error(error);
        alert("Erro ao cadastrar funcionário: " + error.message);
    }
});


// Desativar funcionario

async function desativarFuncionario(id) {
    const token = localStorage.getItem('token')

    if (!token) {
        window.location.href = 'login.html'
        return
    }

    const confirmacao = confirm("Tem certeza que deseja desativar este funcionário?")
    if (!confirmacao) return

    try {
        const response = await fetch(`${API_URL}/employees/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error("Erro ao desativar funcionário")
        }

        alert("Funcionário desativado com sucesso!")

        carregarFuncionarios()

    } catch (error) {
        console.error(error)
        alert(error.message)
    }
}

//  Permissoes

function aplicarPermissoes() {

    const user = window.currentUser || JSON.parse(localStorage.getItem("user"))
    
    if (!user) return

    const editBtns = document.querySelectorAll(".btn-edit")
    const deleteBtns = document.querySelectorAll(".btn-delete")

    // FUNCIONÁRIO não pode ver ações
    if (user.role === "FUNCIONARIO") {
        editBtns.forEach(btn => btn.style.display = "none")
        deleteBtns.forEach(btn => btn.style.display = "none")
    }

    // GERENTE não pode deletar
    if (user.role === "GERENTE") {
       deleteBtns.forEach(btn => btn.style.display = "none") 
    }
}

carregarFuncionarios();
