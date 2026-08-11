// ==========================================
// ESTADOS GLOBAIS DA TELA
// ==========================================
const epiForm = document.getElementById("epiForm");
const epiTable = document.getElementById("epiTable");
const nomeEpiInput = document.getElementById("nomeEpi");
const loteEpiInput = document.getElementById("loteEpi");
const descricaoEpiInput = document.getElementById("descricaoEpi");
const quantidadeEpiInput = document.getElementById("quantidadeEpi");
const vencimentoEpiInput = document.getElementById('vencimentoEpi');
const epiNamesList = document.getElementById('epiNames');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEpiBtn = document.getElementById('saveEpiBtn');

// Elementos do Modal
const historyModalOverlay = document.getElementById('historyModalOverlay');
const historyModalContent = document.getElementById('historyModalContent');
const historyModalSubtitle = document.getElementById('historyModalSubtitle');
const closeHistoryModalBtn = document.getElementById('closeHistoryModal');

let episExistentes = []; // Memória local de EPIs
let displayedCount = 5;  // Quantidade inicial na tela
let editingEpiId = null;

// ==========================================
// RENDERIZAÇÃO INTELIGENTE (Table -> Cards)
// ==========================================
function renderEpis() {
    if (!epiTable) return;
    epiTable.innerHTML = '';

    // Filtra apenas a quantidade que deve aparecer na tela
    const toShow = episExistentes.slice(0, displayedCount);

    if (toShow.length === 0) {
        epiTable.innerHTML = `
            <tr class="block md:table-row w-full">
                <td colspan="9" class="p-6 text-center text-sm text-slate-500 italic border-b-0 block md:table-cell w-full">
                    Nenhum EPI cadastrado no sistema.
                </td>
            </tr>`;
        return;
    }

    // Classes responsivas estabilizadas, seguindo o padrão da tela de funcionários
    const trClass = "flex flex-col lg:table-row bg-white border border-slate-200 lg:border-0 lg:border-b lg:border-slate-200 rounded-xl lg:rounded-none shadow-sm lg:shadow-none mb-4 lg:mb-0 hover:bg-slate-50 transition-colors overflow-hidden w-full";
    const tdClass = "p-4 lg:py-3 lg:px-3 text-sm text-slate-700 flex justify-between lg:table-cell items-center border-b border-slate-100 lg:border-0 last:border-0 w-full min-w-0";
    const labelClass = "lg:hidden font-semibold text-slate-900 shrink-0 mr-4";

    toShow.forEach(epi => {
        const dataCadastro = (epi.dataCadastro || epi.createdAt) ? new Date(epi.dataCadastro || epi.createdAt) : null;
        const formattedDateTime = dataCadastro ? dataCadastro.toLocaleDateString('pt-BR') : '-';
        const formattedVencimento = epi.vencimento && epi.vencimento !== "N/A" ? new Date(epi.vencimento).toLocaleDateString('pt-BR') : '-';
        const initialQtd = epi.initialQuantidade ?? epi.quantidade ?? 0;

        epiTable.innerHTML += `
    <tr class="${trClass}">
        <td class="${tdClass} hidden lg:table-cell"><span class="font-medium text-slate-500">#${epi.id}</span></td>
        
        <td class="${tdClass}">
            <span class="${labelClass}">Nome</span>
            <strong class="text-slate-900 lg:font-normal text-right truncate ml-auto max-w-[70%] lg:max-w-none" title="${epi.nome}">${epi.nome}</strong>
        </td>
        
        <td class="${tdClass}">
            <span class="${labelClass}">Lote</span>
            <span class="text-right truncate ml-auto max-w-[60%] lg:max-w-none" title="${epi.lote}">${epi.lote}</span>
        </td>
        
        <td class="${tdClass}">
            <span class="${labelClass}">Descrição</span>
            <span class="truncate text-right ml-auto max-w-[50%] lg:max-w-[150px]" title="${epi.descricao}">${epi.descricao}</span>
        </td>
        
        <td class="${tdClass}">
            <span class="${labelClass}">Vencimento</span>
            <span class="text-right ml-auto ${epi.vencimento && new Date(epi.vencimento) < new Date() ? 'text-red-600 font-medium' : ''}">${formattedVencimento}</span>
        </td>
        
        <td class="${tdClass} hidden lg:table-cell">
            <span>${initialQtd}</span>
        </td>
        
        <td class="${tdClass}">
            <span class="${labelClass}">Qtd. Atual</span>
            <span class="font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md border border-brand-100 ml-auto">${epi.quantidade}</span>
        </td>
        
        <td class="${tdClass} hidden lg:table-cell">
            <span>${formattedDateTime}</span>
        </td>
        
        <td class="${tdClass} lg:text-center bg-slate-50 lg:bg-transparent">
            <span class="${labelClass}">Ações</span>
            <div class="flex gap-2 justify-end ml-auto">
                <button type="button" class="flex items-center justify-center w-9 h-9 text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors border border-slate-200" onclick="abrirHistorico(${epi.id})" title="Histórico">
                    <i class="fas fa-history"></i>
                </button>
                <button type="button" class="flex items-center justify-center w-9 h-9 text-brand-600 bg-brand-50 hover:bg-brand-100 hover:text-brand-700 rounded-lg transition-colors border border-brand-100" onclick="editarEpi(${epi.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="flex items-center justify-center w-9 h-9 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors border border-red-100" onclick="deletarEpi(${epi.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>
`;
    });

    // Injeta botão de paginação com suporte total a blocos no mobile
    if (episExistentes.length > displayedCount) {
    epiTable.innerHTML += `
        <tr class="block lg:table-row border-none w-full">
            <td colspan="9" class="p-4 text-center border-none block lg:table-cell w-full">
                <button type="button" onclick="carregarMaisEpis()" class="w-full lg:w-auto bg-white border-2 border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-600 font-medium py-3 px-8 rounded-xl transition-all shadow-sm">
                    Ver mais EPIs (${episExistentes.length - displayedCount} restantes)
                </button>
            </td>
        </tr>
    `;
}

    if (typeof aplicarPermissoesGlobais === 'function') aplicarPermissoesGlobais();
}

window.carregarMaisEpis = function() {
    displayedCount += 5;
    renderEpis();
};

// ==========================================
// COMUNICAÇÃO COM A API (CRUD)
// ==========================================
async function carregarEpis() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    try {
        const response = await fetch(`${API_URL}/epis`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Falha ao carregar os EPIs');
        }

        const data = await response.json();
        
        // Blindagem contra payloads inconsistentes da API
        episExistentes = data.map(ep => ({
            ...ep,
            id: ep.id || "N/A",
            nome: ep.nome || "Nome não informado",
            lote: ep.lote || "Não definido",
            descricao: ep.descricao || "Sem descrição",
            vencimento: ep.vencimento || "N/A",
            quantidade: ep.quantidade !== undefined ? ep.quantidade : 0
        }));
        
        renderEpis();
        populateEpiNames(episExistentes);

    } catch (error) {
        console.error(error);
        if (epiTable) epiTable.innerHTML = `<tr class="w-full block md:table-row"><td colspan="9" class="p-4 text-center text-red-500 w-full block md:table-cell">Erro de conexão com o servidor.</td></tr>`;
    }
}

// ==========================================
// AÇÕES DO USUÁRIO & FORMULÁRIO
// ==========================================
function resetForm() {
    editingEpiId = null;
    epiForm.reset();
    cancelEditBtn.style.display = 'none';
    saveEpiBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar EPI';
    saveEpiBtn.classList.replace('bg-green-600', 'bg-brand-600');
    saveEpiBtn.classList.replace('hover:bg-green-700', 'hover:bg-brand-700');
    nomeEpiInput.placeholder = 'Nome do EPI';
    loteEpiInput.placeholder = 'Lote';
    descricaoEpiInput.placeholder = 'Descrição';
}

window.editarEpi = function(id) {
    const epi = episExistentes.find(ep => ep.id === id);
    if (!epi) return;

    editingEpiId = epi.id;
    // Resgata os valores e limpa os fallbacks para não sujar o input do usuário
    nomeEpiInput.value = epi.nome === "Nome não informado" ? "" : epi.nome;
    loteEpiInput.value = epi.lote === "Não definido" ? "" : epi.lote;
    descricaoEpiInput.value = epi.descricao === "Sem descrição" ? "" : epi.descricao;
    quantidadeEpiInput.value = epi.quantidade;
    
    // Tratamento seguro para formatação de data ISO para input type="date"
    if (epi.vencimento && epi.vencimento !== "N/A") {
        try {
            vencimentoEpiInput.value = new Date(epi.vencimento).toISOString().slice(0,10);
        } catch(e) {
            vencimentoEpiInput.value = '';
        }
    } else {
        vencimentoEpiInput.value = '';
    }
    
    cancelEditBtn.style.display = 'inline-flex';
    saveEpiBtn.innerHTML = '<i class="fa-solid fa-check"></i> Atualizar EPI';
    saveEpiBtn.classList.replace('bg-brand-600', 'bg-green-600');
    saveEpiBtn.classList.replace('hover:bg-brand-700', 'hover:bg-green-700');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletarEpi = async function(id) {
    const epi = episExistentes.find(ep => ep.id === id);
    if (!epi) return;

    if (!confirm(`Tem certeza que deseja excluir o EPI ${epi.nome} (Lote: ${epi.lote})?`)) return;

    try {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = 'login.html'; return; }

        const response = await fetch(`${API_URL}/epis/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            const respBody = await response.json().catch(() => null);
            throw new Error(respBody?.error || respBody?.message || 'Erro ao excluir EPI');
        }

        alert('EPI excluído com sucesso!');
        if (editingEpiId === id) resetForm();
        carregarEpis();

    } catch (error) {
        console.error(error);
        alert('Erro ao excluir EPI: ' + error.message);
    }
};

// ==========================================
// LÓGICA DO MODAL DE HISTÓRICO
// ==========================================
window.abrirHistorico = function(id) {
    const epi = episExistentes.find(ep => ep.id === id);
    if (!epi) return;

    historyModalSubtitle.textContent = `EPI: ${epi.nome} — Lote: ${epi.lote}`;
    historyModalContent.innerHTML = '<div class="flex justify-center p-8"><i class="fa-solid fa-spinner fa-spin text-3xl text-brand-500"></i></div>';
    
    historyModalOverlay.classList.remove('hidden');
    historyModalOverlay.classList.add('flex');

    fetch(`${API_URL}/epis/${epi.id}/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => {
        if (!response.ok) throw new Error('Não foi possível carregar o histórico');
        return response.json();
    })
    .then(history => {
        if (!history || history.length === 0) {
            historyModalContent.innerHTML = '<p class="text-slate-500 text-center py-6">Nenhuma edição registrada para este EPI.</p>';
            return;
        }

        historyModalContent.innerHTML = history.map(entry => {
            const when = new Date(entry.createdAt).toLocaleString('pt-BR');
            return `
                <article class="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <div class="flex justify-between items-center mb-2">
                        <strong class="text-slate-800 text-sm"><i class="fa-solid fa-user-pen text-slate-400 mr-2"></i>${entry.user?.name || 'Usuário ' + entry.userId}</strong>
                        <span class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">${when}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm mt-3 bg-white p-3 rounded border border-slate-100">
                        <div><span class="text-slate-500 block text-xs">Nome Anterior</span><span class="font-medium text-slate-700">${entry.previousNome || '-'}</span></div>
                        <div><span class="text-slate-500 block text-xs">Lote Anterior</span><span class="font-medium text-slate-700">${entry.previousLote || '-'}</span></div>
                        <div class="col-span-2"><span class="text-slate-500 block text-xs">Descrição Anterior</span><span class="font-medium text-slate-700">${entry.previousDescricao || '-'}</span></div>
                        <div><span class="text-slate-500 block text-xs">Quantidade Alterada</span><span class="font-medium text-brand-600">${entry.previousQuantidade}</span></div>
                    </div>
                </article>
            `;
        }).join('');
    })
    .catch(error => {
        console.error(error);
        historyModalContent.innerHTML = '<p class="text-red-500 text-center py-6"><i class="fa-solid fa-triangle-exclamation mr-2"></i> Erro ao carregar histórico.</p>';
    });
};

function closeHistoryModal() {
    historyModalOverlay.classList.add('hidden');
    historyModalOverlay.classList.remove('flex');
}

if (closeHistoryModalBtn) closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
if (historyModalOverlay) {
    historyModalOverlay.addEventListener('click', (event) => {
        if (event.target === historyModalOverlay) closeHistoryModal();
    });
}
if (cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);

// ==========================================
// DATALIST E AUTOCOMPLETAR
// ==========================================
function populateEpiNames(epis) {
    const nomesUnicos = [...new Map(epis.map(e => [e.nome, e.nome])).values()];
    if(epiNamesList) {
        epiNamesList.innerHTML = '';
        nomesUnicos.forEach(nome => {
            const option = document.createElement('option');
            option.value = nome;
            epiNamesList.appendChild(option);
        });
    }
}

nomeEpiInput.addEventListener('input', (e) => {
    const val = e.target.value;
    const match = episExistentes.find(ep => ep.nome.toLowerCase() === val.toLowerCase());
    if (match) {
        loteEpiInput.placeholder = `Sugestão de lote: ${match.lote}`;
        descricaoEpiInput.placeholder = match.descricao || 'Descrição disponível';
    } else {
        loteEpiInput.placeholder = 'Lote';
        descricaoEpiInput.placeholder = 'Descrição';
    }
});

// ==========================================
// SUBMIT DE FORMULÁRIO (CRIAR / ATUALIZAR)
// ==========================================
if (epiForm) {
    epiForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = nomeEpiInput.value.trim();
        const lote = loteEpiInput.value.trim();
        const descricao = descricaoEpiInput.value.trim();
        const quantidade = parseInt(quantidadeEpiInput.value, 10);
        const vencimento = vencimentoEpiInput.value;

        if (!nome || !lote) { alert("Nome e Lote são obrigatórios"); return; }
        
        const loteExiste = episExistentes.some(ep => ep.lote.toLowerCase() === lote.toLowerCase() && ep.id !== editingEpiId);
        if (loteExiste) { alert("Esse lote já existe. Use outro lote ou atualize o registro existente."); return; }

        if (!Number.isInteger(quantidade) || quantidade <= 0) { alert("Quantidade deve ser um número inteiro maior que 0"); return; }

        try {
            const token = localStorage.getItem('token');
            if (!token) { window.location.href = 'login.html'; return; }

            const payload = {
                nome, lote, descricao,
                quantidade: Number(quantidade),
                vencimento: vencimento ? new Date(vencimento).toISOString() : null
            };

            const method = editingEpiId ? 'PUT' : 'POST';
            const url = editingEpiId ? `${API_URL}/epis/${editingEpiId}` : `${API_URL}/epis`;

            const originalBtnHTML = saveEpiBtn.innerHTML;
            saveEpiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';
            saveEpiBtn.disabled = true;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            saveEpiBtn.disabled = false;
            saveEpiBtn.innerHTML = originalBtnHTML;

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || errorData?.message || 'Erro ao cadastrar EPI');
            }

            const wasEditing = Boolean(editingEpiId);
            resetForm();
            displayedCount = 5; 
            await carregarEpis();
            alert(wasEditing ? 'EPI atualizado com sucesso!' : 'EPI cadastrado com sucesso!');

        } catch (error) {
            console.error(error);
            alert('Erro ao cadastrar EPI: ' + error.message);
        }
    });
}

// INICIALIZAÇÃO
carregarEpis();