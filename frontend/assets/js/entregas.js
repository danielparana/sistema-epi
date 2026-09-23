// ==========================================
// ESTADOS GLOBAIS DA TELA
// ==========================================
const deliveryForm = document.getElementById('deliveryForm');
const employeeSelect = document.getElementById('employeeSelect');
const epiSelect = document.getElementById('epiSelect');
const loteField = document.getElementById('selectedLot');
const stockField = document.getElementById('stockInfo');
const quantityInput = document.getElementById('quantityInput');
const deliveryTable = document.getElementById('deliveryTable');
const submitBtn = deliveryForm ? deliveryForm.querySelector('button[type="submit"]') : null;

let employees = [];
let epis = [];

let allDeliveries = [];

let currentPage = 1;
const pageLimit = 5;
let totalPages = 1;
let totalRecords = 0;

let searchTerm = "";
let loadingDeliveries = false;
let searchTimeout = null;

// ==========================================
// BOOTSTRAP DE DADOS
// ==========================================
async function carregarEntregas() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    // LIMPA O AVISO: Remove a barra caso seja uma tentativa de reconexão
    removerAvisoOffline();

    try {
        // Roda todas as requisições em paralelo para carregar a tela mais rápido
        await Promise.all([
            carregarFuncionarios(token), 
            carregarEpis(token), 
            carregarTabelaEntregas(token, 1)
        ]);
    } catch (error) {
        console.error("Erro ao carregar dependências de entregas:", error);
        
        // BARRA DE REDE: Chama a nossa barra global corporativa
        exibirAvisoOffline();
    }
}

function handleApiError(response) {
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// ==========================================
// RENDERIZAÇÃO INTELIGENTE E BLINDADA
// ==========================================
function renderDeliveries() {
    if (!deliveryTable) return;

    deliveryTable.innerHTML = '';

    if (allDeliveries.length === 0) {
        deliveryTable.innerHTML = `
            <tr class="block lg:table-row w-full">
                <td colspan="6" class="p-6 text-center text-sm text-slate-500 italic border-b-0 block lg:table-cell w-full">
                    ${searchTerm
                        ? 'Nenhuma entrega encontrada para essa busca.'
                        : 'Nenhuma entrega registrada no sistema.'}
                </td>
            </tr>
        `;
        return;
    }

    const trClass = "flex flex-col lg:table-row bg-white border border-slate-200 lg:border-0 lg:border-b lg:border-slate-200 rounded-xl lg:rounded-none shadow-sm lg:shadow-none mb-4 lg:mb-0 hover:bg-slate-50 transition-colors overflow-hidden w-full";
    const tdClass = "p-4 lg:py-4 lg:px-4 text-sm text-slate-700 flex justify-between lg:table-cell items-center border-b border-slate-100 lg:border-0 last:border-0 w-full min-w-0";
    const labelClass = "lg:hidden font-semibold text-slate-900 shrink-0 mr-4";

    allDeliveries.forEach(delivery => {

        const dataOrigem = delivery.dataEntrega || delivery.createdAt;
        const createdAt = dataOrigem ? new Date(dataOrigem) : new Date();

        const formattedDate = `${createdAt.toLocaleDateString('pt-BR')} às ${createdAt.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;

        deliveryTable.innerHTML += `
            <tr class="${trClass}">
                <td class="${tdClass} hidden lg:table-cell">
                    <span class="font-medium text-slate-500">#${delivery.id}</span>
                </td>

                <td class="${tdClass}">
                    <span class="${labelClass}">Funcionário</span>
                    <strong
                        class="text-slate-900 lg:font-medium text-right truncate ml-auto max-w-[65%] lg:max-w-none"
                        title="${delivery.employee?.nome || 'Não identificado'}"
                    >
                        <i class="fa-solid fa-user text-slate-400 mr-2 lg:hidden"></i>
                        ${delivery.employee?.nome || 'Não identificado'}
                    </strong>
                </td>

                <td class="${tdClass}">
                    <span class="${labelClass}">EPI</span>
                    <span
                        class="text-slate-800 text-right truncate ml-auto max-w-[65%] lg:max-w-none"
                        title="${delivery.epi?.nome || 'Não identificado'}"
                    >
                        <i class="fa-solid fa-helmet-safety text-slate-400 mr-2 lg:hidden"></i>
                        ${delivery.epi?.nome || 'Não identificado'}
                    </span>
                </td>

                <td class="${tdClass}">
                    <span class="${labelClass}">Lote</span>
                    <span
                        class="bg-slate-100 text-slate-700 py-1 px-3 rounded-md text-xs font-medium border border-slate-200 ml-auto truncate max-w-[50%] lg:max-w-none"
                        title="${delivery.epi?.lote || '-'}"
                    >
                        ${delivery.epi?.lote || '-'}
                    </span>
                </td>

                <td class="${tdClass}">
                    <span class="${labelClass}">Qtd. Entregue</span>
                    <span class="font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-md border border-brand-100 ml-auto">
                        ${delivery.quantidade}
                    </span>
                </td>

                <td class="${tdClass} bg-slate-50 lg:bg-transparent">
                    <span class="${labelClass}">Data/Hora</span>
                    <span class="text-slate-500 text-xs lg:text-sm lg:text-slate-700 ml-auto text-right">
                        <i class="fa-regular fa-clock mr-1 hidden lg:inline"></i>
                        ${formattedDate}
                    </span>
                </td>
            </tr>
        `;
    });

    if (currentPage < totalPages) {
        deliveryTable.innerHTML += `
            <tr class="block lg:table-row border-none w-full">
                <td colspan="6" class="p-4 text-center border-none block lg:table-cell w-full">
                    <button
                        type="button"
                        onclick="carregarMaisEntregas()"
                        class="w-full lg:w-auto bg-white border-2 border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-600 font-medium py-3 px-8 rounded-xl transition-all shadow-sm"
                    >
                        Ver mais entregas
                    </button>
                </td>
            </tr>
        `;
    }
}

window.carregarMaisEntregas = async function() {
    if (loadingDeliveries || currentPage >= totalPages) return;

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await carregarTabelaEntregas(token, currentPage + 1);
};

// ==========================================
// COMUNICAÇÃO COM A API (GET)
// ==========================================
async function carregarFuncionarios(token) {
    const response = await fetch(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) { handleApiError(response); return; }

    
    const json = await response.json();
    employees = Array.isArray(json) ? json : (json.data || json.funcionarios || json.employees || []);

    if (employeeSelect) {
        employeeSelect.innerHTML = '<option value="">Selecione o funcionário</option>';
        employees.forEach(employee => {
            employeeSelect.innerHTML += `<option value="${employee.id}">${employee.nome}</option>`;
        });
    }
}

async function carregarEpis(token) {
    const response = await fetch(`${API_URL}/epis`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) { handleApiError(response); return; }

    const result = await response.json();

    epis = Array.isArray(result)
        ? result
        : (result.data || result.epis || result.epi || []);

    if (epiSelect) {
        epiSelect.innerHTML = '<option value="">Selecione o EPI</option>';
        // Filtra apenas EPIs que possuem estoque no front-end
        const episDisponiveis = epis.filter(epi => (epi.quantidade !== undefined ? epi.quantidade : 0) > 0);
        
        episDisponiveis.forEach(epi => {
            epiSelect.innerHTML += `<option value="${epi.id}">${epi.nome || 'Sem Nome'} - Lote ${epi.lote || 'N/A'} (Estoque: ${epi.quantidade})</option>`;
        });
        
        if(episDisponiveis.length === 0) {
            epiSelect.innerHTML = '<option value="">Nenhum EPI com estoque disponível</option>';
        }
    }
}

async function carregarTabelaEntregas(token, page = 1) {
    if (loadingDeliveries) return;

    loadingDeliveries = true;

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: pageLimit.toString()
        });

        if (searchTerm) {
            params.set('search', searchTerm);
        }

        const response = await fetch(
            `${API_URL}/deliveries?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            handleApiError(response);
            return;
        }

        const json = await response.json();

        const data = Array.isArray(json)
            ? json
            : (json.data || json.deliveries || []);

        const meta = json.meta || {};

        currentPage = meta.currentPage || page;
        totalPages = meta.totalPages || 1;
        totalRecords = meta.totalRecords || 0;

        const deliveries = data.map(d => ({
            ...d,
            id: d.id || 'N/A',
            quantidade: d.quantidade || 0,

            employee: {
                ...(d.employee || {}),
                nome: d.employee?.nome || 'Funcionário Excluído'
            },

            epi: {
                ...(d.epi || {}),
                nome: d.epi?.nome || 'EPI Excluído',
                lote: d.epi?.lote || 'N/A'
            },

            dataEntrega: d.dataEntrega || d.createdAt || null
        }));

        if (page === 1) {
            allDeliveries = deliveries;
        } else {
            allDeliveries = [...allDeliveries, ...deliveries];
        }

        renderDeliveries();
        atualizarBuscaEntrega();

    } catch (error) {
        console.error(error);

        if (deliveryTable) {
            deliveryTable.innerHTML = `
                <tr class="block md:table-row w-full">
                    <td colspan="6" class="p-4 text-center text-red-500 block md:table-cell w-full">
                        Erro de conexão com o servidor.
                    </td>
                </tr>
            `;
        }

    } finally {
        loadingDeliveries = false;
    }
}

// ==========================================
// INTERAÇÕES DE FORMULÁRIO
// ==========================================
function atualizarInfoEpi() {
    const epiId = Number(epiSelect.value);
    const epi = epis.find(item => item.id === epiId);

    if (epi) {
        loteField.value = epi.lote || 'N/A';
        stockField.textContent = `Estoque atual: ${epi.quantidade || 0}`;
        stockField.classList.remove('hidden');
        quantityInput.max = epi.quantidade || 1; 
    } else {
        loteField.value = '';
        stockField.textContent = '';
        stockField.classList.add('hidden');
        quantityInput.removeAttribute('max');
    }
}

if (epiSelect) {
    epiSelect.addEventListener('change', atualizarInfoEpi);
}

// ==========================================
// REGISTRO DE ENTREGA (POST)
// ==========================================
if (deliveryForm) {
    deliveryForm.addEventListener('submit', async event => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) { window.location.href = 'login.html'; return; }

        const employeeId = employeeSelect.value;
        const epiId = epiSelect.value;
        const quantidade = Number(quantityInput.value);

        if (!employeeId || !epiId || !quantidade || quantidade <= 0) {
            alert('Preencha funcionário, EPI e quantidade válidos');
            return;
        }

        const epiSelecionado = epis.find(item => item.id === Number(epiId));
        if (epiSelecionado && quantidade > (epiSelecionado.quantidade || 0)) {
            alert(`Atenção: A quantidade solicitada (${quantidade}) é maior que o estoque atual (${epiSelecionado.quantidade || 0}).`);
            return;
        }

        try {
            const originalBtnHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';
            submitBtn.disabled = true;

            const response = await fetch(`${API_URL}/deliveries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ employeeId, epiId, quantidade })
            });

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Erro ao registrar entrega');
            }

            // Reset da interface
            employeeSelect.value = '';
            epiSelect.value = '';
            quantityInput.value = 1;
            loteField.value = '';
            stockField.textContent = '';
            stockField.classList.add('hidden');
            
            currentPage = 1;
            totalPages = 1;
            totalRecords = 0;
            allDeliveries = [];

            await carregarEntregas();
            
            alert('Entrega registrada com sucesso!');

        } catch (error) {
            console.error(error);
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Registrar Entrega';
            }
            alert(error.message);
        }
    });
}

function atualizarBuscaEntrega() {
    const searchInfo = document.getElementById('searchDeliveryInfo');

    if (!searchInfo) return;

    if (searchTerm) {
        searchInfo.textContent =
            `${totalRecords} entrega(s) encontrada(s) para "${searchTerm}"`;

        searchInfo.classList.remove('hidden');
    } else {
        searchInfo.classList.add('hidden');
    }
}

const searchDeliveryInput = document.getElementById('searchDelivery');
const clearSearchDeliveryBtn = document.getElementById('clearSearchDelivery');

if (searchDeliveryInput) {
    searchDeliveryInput.addEventListener('input', () => {

        searchTerm = searchDeliveryInput.value.trim();

        if (clearSearchDeliveryBtn) {
            clearSearchDeliveryBtn.classList.toggle(
                'hidden',
                searchTerm.length === 0
            );
        }

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            currentPage = 1;
            totalPages = 1;
            totalRecords = 0;
            allDeliveries = [];

            await carregarTabelaEntregas(token, 1);

        }, 400);
    });
}

if (clearSearchDeliveryBtn) {
    clearSearchDeliveryBtn.addEventListener('click', async () => {

        searchDeliveryInput.value = '';
        searchTerm = '';

        clearSearchDeliveryBtn.classList.add('hidden');

        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        currentPage = 1;
        totalPages = 1;
        totalRecords = 0;
        allDeliveries = [];

        await carregarTabelaEntregas(token, 1);

        searchDeliveryInput.focus();
    });
}

// INICIALIZAÇÃO
carregarEntregas();