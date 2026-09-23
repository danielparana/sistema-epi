// ==========================================
// ESTADOS GLOBAIS DA TELA
// ==========================================
const employeeForm = document.getElementById("employeeForm");
const employeeTable = document.getElementById("employeeTable");
const cpfInput = document.getElementById("cpf");
const cpfError = document.getElementById("cpfError");

// Elementos de busca
const searchEmployeeInput = document.getElementById("searchEmployee");
const clearSearchEmployeeBtn = document.getElementById("clearSearchEmployee");
const searchEmployeeInfo = document.getElementById("searchEmployeeInfo");

let allEmployees = [];
let currentPage = 1;
const pageLimit = 5;
let totalPages = 1;
let totalRecords = 0;

let editingEmployeeId = null;

let searchTerm = "";
let loadingEmployees = false;
let searchTimeout = null;

// ==========================================
// MÁSCARA E VALIDAÇÃO DE CPF
// ==========================================
cpfInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (value.length > 11) value = value.slice(0, 11);
    
    // Aplica a formatação: 000.000.000-00
    if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
    }
    e.target.value = value;
});

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11) return false;
    
    // Verifica CPFs sequenciais inválidos
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto >= 10) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto >= 10) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}

cpfInput.addEventListener('blur', () => {
    const cpf = cpfInput.value.trim();
    if (cpf && !validarCPF(cpf)) {
        cpfError.textContent = 'CPF inválido';
        cpfError.classList.remove('hidden');
    } else {
        cpfError.classList.add('hidden');
    }
});

// ==========================================
// RENDERIZAÇÃO INTELIGENTE E BLINDADA
// ==========================================
function renderEmployees() {
    employeeTable.innerHTML = '';
    
    // Filtra apenas a quantidade que deve aparecer na tela
    const toShow = allEmployees;

    if (toShow.length === 0) {
        employeeTable.innerHTML = `
            <tr>
                <td colspan="5" class="p-6 text-center text-sm text-slate-500 italic border-b-0 block lg:table-cell w-full">
                    Nenhum funcionário cadastrado no sistema.
                </td>
            </tr>`;
        return;
    }

    // Classes responsivas ajustadas para lg (Tablets exibirão cards)
    const trClass = "flex flex-col lg:table-row bg-white border border-slate-200 lg:border-0 lg:border-b lg:border-slate-200 rounded-xl lg:rounded-none shadow-sm lg:shadow-none mb-4 lg:mb-0 hover:bg-slate-50 transition-colors overflow-hidden w-full";
    const tdClass = "p-4 lg:py-3 lg:px-4 text-sm text-slate-700 flex justify-between lg:table-cell items-center border-b border-slate-100 lg:border-0 last:border-0 w-full min-w-0";
    const labelClass = "lg:hidden font-semibold text-slate-900 shrink-0 mr-4";

    toShow.forEach(funcionario => {
        // Sanitização (Fail-Safe) contra dados corrompidos do backend
        const idSafe = funcionario.id || "N/A";
        const nomeSafe = funcionario.nome || "Nome Indisponível";
        const cpfSafe = funcionario.cpf || "Não informado";
        const cargoSafe = funcionario.cargo || "Não atribuído";

        employeeTable.innerHTML += `
            <tr class="${trClass}">
                <td class="${tdClass}">
                    <span class="${labelClass}">ID</span>
                    <span class="font-medium text-slate-500 lg:text-slate-700 truncate">#${idSafe}</span>
                </td>
                <td class="${tdClass}">
                    <span class="${labelClass}">Nome</span>
                    <strong class="text-slate-900 lg:font-normal text-right truncate ml-auto pl-4 max-w-[70%] lg:max-w-none" title="${nomeSafe}">${nomeSafe}</strong>
                </td>
                <td class="${tdClass}">
                    <span class="${labelClass}">CPF</span>
                    <span class="text-right truncate">${cpfSafe}</span>
                </td>
                <td class="${tdClass}">
                    <span class="${labelClass}">Cargo</span>
                    <span class="bg-slate-100 text-slate-700 py-1 px-3 rounded-full text-xs font-medium border border-slate-200 truncate max-w-[60%] lg:max-w-none text-right" title="${cargoSafe}">${cargoSafe}</span>
                </td>
                <td class="${tdClass} lg:text-center bg-slate-50 lg:bg-transparent">
                    <span class="${labelClass}">Ações</span>
                    <div class="flex gap-2 ml-auto lg:mx-auto lg:justify-center">
                        <button class="btn-edit flex items-center justify-center w-9 h-9 text-brand-600 bg-brand-50 hover:bg-brand-100 hover:text-brand-700 rounded-lg transition-colors border border-brand-100" onclick="editarFuncionario(${idSafe})" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-delete flex items-center justify-center w-9 h-9 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors border border-red-100" onclick="desativarFuncionario(${idSafe})" title="Desativar">
                            <i class="fa-solid fa-user-slash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    // Injeta o botão "Carregar Mais" se houver funcionários ocultos
        if (currentPage < totalPages) {
        employeeTable.innerHTML += `
            <tr class="block lg:table-row border-none w-full">
                <td colspan="5" class="p-4 text-center border-none block lg:table-cell w-full">
                    <button
                        type="button"
                        onclick="carregarMais()"
                        class="w-full lg:w-auto bg-white border-2 border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-600 font-medium py-3 px-8 rounded-xl transition-all shadow-sm">

                        Ver mais funcionários

                    </button>
                </td>
            </tr>
        `;
    }

    aplicarPermissoes();
}
// Aumenta o limite de exibição e re-renderiza
window.carregarMais = async function() {

    if (currentPage >= totalPages) {
        return;
    }

    await carregarFuncionarios(currentPage + 1);
};

// ==========================================
// COMUNICAÇÃO COM A API (CRUD)
// ==========================================
async function carregarFuncionarios(page = 1) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // LIMPA O AVISO: Se houver uma nova tentativa de carregar, remove a barra antiga
    removerAvisoOffline();

    if (loadingEmployees) return;
    loadingEmployees = true;

    // Feedback visual seguro: reduz a opacidade sem destruir os dados da tabela
    if (employeeTable) employeeTable.style.opacity = '0.5';

    try {
        const params = new URLSearchParams({ page, limit: pageLimit });
        if (searchTerm) params.set('search', searchTerm);

        const response = await fetch(`${API_URL}/employees?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Falha ao carregar funcionários');
        }

        const result = await response.json();
        const employees = result.data || [];
        const meta = result.meta || {};

        // SUCESSO: Atualização das variáveis globais após validação do servidor
        currentPage = meta.currentPage || page;
        totalPages = meta.totalPages || 1;
        totalRecords = meta.totalRecords || employees.length;

        // Formatação de segurança para o array processado
        const formattedEmployees = employees.map(emp => {
            if (!emp.cpf) return emp;
            const rawCpf = String(emp.cpf).replace(/\D/g, '');
            const formattedCpf = rawCpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
            return { ...emp, cpf: formattedCpf };
        });

        if (page === 1) {
            allEmployees = formattedEmployees;
        } else {
            allEmployees = [...allEmployees, ...formattedEmployees];
        }

        // Restaura a opacidade e renderiza a nova informação
        if (employeeTable) employeeTable.style.opacity = '1';
        renderEmployees();
        atualizarBuscaFuncionario();

    } catch (error) {
        console.error(error);

        // FALHA: Preservação de estado ativada. Restaura opacidade e mantém a tabela original no ecrã.
        if (employeeTable) employeeTable.style.opacity = '1';

        // BARRA DE REDE: Chama a nossa barra global corporativa em vez do alert() nativo
        exibirAvisoOffline();
    } finally {
        loadingEmployees = false;
    }
}

// ==========================================
// AÇÕES DO USUÁRIO
// ==========================================
window.editarFuncionario = function(id) {
    if (!id || id === "N/A") return;
    const funcionario = allEmployees.find(f => f.id == id); // Usa == para garantir match de tipo
    if (!funcionario) return;

    document.getElementById("nome").value = funcionario.nome || '';
    document.getElementById("cpf").value = funcionario.cpf || '';
    document.getElementById("cargo").value = funcionario.cargo || '';
    editingEmployeeId = id;

    const btn = employeeForm.querySelector("button");
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Alterações';
    btn.classList.replace('bg-brand-600', 'bg-green-600');
    btn.classList.replace('hover:bg-brand-700', 'hover:bg-green-700');
    
    // UX: Rola a tela suavemente para o formulário no mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

employeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpfRaw = document.getElementById("cpf").value;
    const cargo = document.getElementById("cargo").value;

    if (!validarCPF(cpfRaw)) {
        cpfError.textContent = 'CPF inválido';
        cpfError.classList.remove('hidden');
        return;
    }

    // ENVIO SEGURO: Apenas números para a API
    const cpfClean = cpfRaw.replace(/\D/g, '');

    try {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = 'login.html'; return; }

        const url = editingEmployeeId ? `${API_URL}/employees/${editingEmployeeId}` : `${API_URL}/employees`;
        const method = editingEmployeeId ? 'PUT' : 'POST';

        // Feedback visual de carregamento no botão
        const submitBtn = employeeForm.querySelector("button");
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';
        submitBtn.disabled = true;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ nome, cpf: cpfClean, cargo })
        });

        submitBtn.disabled = false;

        if (!response.ok) {
            submitBtn.innerHTML = originalBtnHTML;
            const erro = await response.json();
            if (erro.error === "CPF já cadastrado") {
                alert("Já existe um funcionário cadastrado com esse CPF.");
                return;
            }
            throw new Error(erro.error || "Erro ao cadastrar");
        }

        // Reseta o estado do formulário
        employeeForm.reset();
        cpfError.classList.add('hidden');
        editingEmployeeId = null;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Cadastrar Funcionário';
        submitBtn.classList.replace('bg-green-600', 'bg-brand-600');
        submitBtn.classList.replace('hover:bg-green-700', 'hover:bg-brand-700');

        // Volta a paginação 
        allEmployees = [];

        await carregarFuncionarios();

        alert(method === 'POST' ? "Funcionário cadastrado com sucesso!" : "Funcionário atualizado com sucesso!");

    } catch (error) {
        console.error(error);
        alert("Erro ao cadastrar funcionário: " + error.message);
    }
});

window.desativarFuncionario = async function(id) {
    if (!id || id === "N/A") return;
    
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    if (!confirm("Tem certeza que deseja desativar este funcionário?")) return;

    try {
        const response = await fetch(`${API_URL}/employees/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro ao desativar funcionário");

        alert("Funcionário desativado com sucesso!");
        carregarFuncionarios(1);

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
};

// ==========================================
// CONTROLE DE ACESSO (PERMISSÕES)
// ==========================================
function aplicarPermissoes() {
    const user = window.currentUser || JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const editBtns = document.querySelectorAll(".btn-edit");
    const deleteBtns = document.querySelectorAll(".btn-delete");

    if (user.role === "FUNCIONARIO") {
        editBtns.forEach(btn => btn.classList.add("hidden"));
        deleteBtns.forEach(btn => btn.classList.add("hidden"));
    }

    if (user.role === "GERENTE") {
       deleteBtns.forEach(btn => btn.classList.add("hidden")); 
    }
}

// ==========================================
// BUSCA DE FUNCIONÁRIOS
// ==========================================

function atualizarBuscaFuncionario() {

    if (!searchEmployeeInput) return;

    const possuiBusca = searchTerm.length > 0;

    if (clearSearchEmployeeBtn) {
        clearSearchEmployeeBtn.classList.toggle(
            'hidden',
            !possuiBusca
        );
    }

    if (searchEmployeeInfo) {

        if (possuiBusca) {

            searchEmployeeInfo.textContent =
                `${totalRecords} funcionário(s) encontrado(s) para "${searchTerm}"`;

            searchEmployeeInfo.classList.remove('hidden');

        } else {

            searchEmployeeInfo.classList.add('hidden');
        }
    }
}


if (searchEmployeeInput) {

    searchEmployeeInput.addEventListener('input', () => {

        searchTerm = searchEmployeeInput.value.trim();

        if (clearSearchEmployeeBtn) {

            clearSearchEmployeeBtn.classList.toggle(
                'hidden',
                searchTerm.length === 0
            );
        }

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {

            carregarFuncionarios(1);

        }, 400);
    });
}


if (clearSearchEmployeeBtn) {

    clearSearchEmployeeBtn.addEventListener('click', () => {

        searchEmployeeInput.value = '';
        searchTerm = '';

        clearSearchEmployeeBtn.classList.add('hidden');

        carregarFuncionarios(1);

        searchEmployeeInput.focus();
    });
}

// INICIALIZAÇÃO
carregarFuncionarios();