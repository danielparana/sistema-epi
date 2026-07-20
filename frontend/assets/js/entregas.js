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
let allDeliveries = [];  // Memória local para a paginação
let displayedCount = 5;  // Quantidade inicial na tela

// ==========================================
// BOOTSTRAP DE DADOS
// ==========================================
async function carregarEntregas() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    // Roda todas as requisições em paralelo para carregar a tela mais rápido
    await Promise.all([
        carregarFuncionarios(token), 
        carregarEpis(token), 
        carregarTabelaEntregas(token)
    ]);
}

function handleApiError(response) {
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// ==========================================
// RENDERIZAÇÃO INTELIGENTE (Table -> Cards)
// ==========================================
function renderDeliveries() {
    if (!deliveryTable) return;
    deliveryTable.innerHTML = '';

    const toShow = allDeliveries.slice(0, displayedCount);

    if (toShow.length === 0) {
        deliveryTable.innerHTML = `
            <tr>
                <td colspan="6" class="p-6 text-center text-sm text-slate-500 italic border-b-0">
                    Nenhuma entrega registrada no sistema.
                </td>
            </tr>`;
        return;
    }

    // Classes responsivas do Tailwind
    const trClass = "flex flex-col md:table-row bg-white border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none shadow-sm md:shadow-none mb-4 md:mb-0 hover:bg-slate-50 transition-colors overflow-hidden";
    const tdClass = "p-4 md:py-4 md:px-4 text-sm text-slate-700 flex justify-between md:table-cell items-center border-b border-slate-100 md:border-0 last:border-0";
    const labelClass = "md:hidden font-semibold text-slate-900";

    toShow.forEach(delivery => {
        const createdAt = new Date(delivery.dataEntrega || delivery.createdAt);
        // Formatação limpa de Data e Hora
        const formattedDate = `${createdAt.toLocaleDateString('pt-BR')} às ${createdAt.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;

        deliveryTable.innerHTML += `
            <tr class="${trClass}">
                <td class="${tdClass} hidden md:table-cell"><span class="font-medium text-slate-500">#${delivery.id}</span></td>
                
                <td class="${tdClass}">
                    <span class="${labelClass}">Funcionário</span>
                    <strong class="text-slate-900 md:font-medium"><i class="fa-solid fa-user text-slate-400 mr-2 md:hidden"></i>${delivery.employee?.nome || 'Desconhecido'}</strong>
                </td>
                
                <td class="${tdClass}">
                    <span class="${labelClass}">EPI</span>
                    <span class="text-slate-800"><i class="fa-solid fa-helmet-safety text-slate-400 mr-2 md:hidden"></i>${delivery.epi?.nome || 'Desconhecido'}</span>
                </td>
                
                <td class="${tdClass}">
                    <span class="${labelClass}">Lote</span>
                    <span class="bg-slate-100 text-slate-700 py-1 px-3 rounded-md text-xs font-medium border border-slate-200">${delivery.epi?.lote || '-'}</span>
                </td>
                
                <td class="${tdClass}">
                    <span class="${labelClass}">Qtd. Entregue</span>
                    <span class="font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-md border border-brand-100">${delivery.quantidade}</span>
                </td>
                
                <td class="${tdClass} bg-slate-50 md:bg-transparent">
                    <span class="${labelClass}">Data/Hora</span>
                    <span class="text-slate-500 text-xs md:text-sm md:text-slate-700"><i class="fa-regular fa-clock mr-1 hidden md:inline"></i>${formattedDate}</span>
                </td>
            </tr>
        `;
    });

    // Injeta botão de paginação se houver dados ocultos
    if (allDeliveries.length > displayedCount) {
        deliveryTable.innerHTML += `
            <tr class="block md:table-row border-none">
                <td colspan="6" class="p-4 text-center border-none">
                    <button type="button" onclick="carregarMaisEntregas()" class="w-full md:w-auto bg-white border-2 border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-600 font-medium py-3 px-8 rounded-xl transition-all shadow-sm">
                        Ver mais entregas (${allDeliveries.length - displayedCount} restantes)
                    </button>
                </td>
            </tr>
        `;
    }
}

window.carregarMaisEntregas = function() {
    displayedCount += 5;
    renderDeliveries();
};

// ==========================================
// COMUNICAÇÃO COM A API (GET)
// ==========================================
async function carregarFuncionarios(token) {
    const response = await fetch(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) { handleApiError(response); return; }

    employees = await response.json();
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

    epis = await response.json();
    if (epiSelect) {
        epiSelect.innerHTML = '<option value="">Selecione o EPI</option>';
        // Filtra apenas EPIs que possuem estoque no front-end para evitar erros de seleção
        const episDisponiveis = epis.filter(epi => epi.quantidade > 0);
        
        episDisponiveis.forEach(epi => {
            epiSelect.innerHTML += `<option value="${epi.id}">${epi.nome} - Lote ${epi.lote} (Estoque: ${epi.quantidade})</option>`;
        });
        
        if(episDisponiveis.length === 0) {
            epiSelect.innerHTML = '<option value="">Nenhum EPI com estoque disponível</option>';
        }
    }
}

async function carregarTabelaEntregas(token) {
    const response = await fetch(`${API_URL}/deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) { handleApiError(response); return; }

    allDeliveries = await response.json();
    renderDeliveries();
}

// ==========================================
// INTERAÇÕES DE FORMULÁRIO
// ==========================================
function atualizarInfoEpi() {
    const epiId = Number(epiSelect.value);
    const epi = epis.find(item => item.id === epiId);

    if (epi) {
        loteField.value = epi.lote;
        stockField.textContent = `Estoque atual: ${epi.quantidade}`;
        stockField.classList.remove('hidden');
        // Define o limite máximo do input de quantidade baseado no estoque
        quantityInput.max = epi.quantidade; 
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

        // Validação extra de segurança no front-end
        const epiSelecionado = epis.find(item => item.id === Number(epiId));
        if (epiSelecionado && quantidade > epiSelecionado.quantidade) {
            alert(`Atenção: A quantidade solicitada (${quantidade}) é maior que o estoque atual (${epiSelecionado.quantidade}).`);
            return;
        }

        try {
            // Feedback de carregamento no botão
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
            
            // Volta para a página inicial da tabela para mostrar a nova entrega
            displayedCount = 5;
            
            // Recarrega os dados para atualizar o estoque nos selects e a tabela
            await carregarEntregas();
            
            alert('Entrega registrada com sucesso!');

        } catch (error) {
            console.error(error);
            submitBtn.disabled = false;
            if(submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-box-open"></i> Registrar Entrega';
            alert(error.message);
        }
    });
}

// INICIALIZAÇÃO
carregarEntregas();