const epiForm = document.getElementById("epiForm")
const epiTable = document.getElementById("epiTable")
const nomeEpiInput = document.getElementById("nomeEpi")
const loteEpiInput = document.getElementById("loteEpi")
const descricaoEpiInput = document.getElementById("descricaoEpi")
const quantidadeEpiInput = document.getElementById("quantidadeEpi")
const vencimentoEpiInput = document.getElementById('vencimentoEpi')
const epiNamesList = document.getElementById('epiNames')
const cancelEditBtn = document.getElementById('cancelEditBtn')
const saveEpiBtn = document.getElementById('saveEpiBtn')
const historyModalOverlay = document.getElementById('historyModalOverlay')
const historyModalContent = document.getElementById('historyModalContent')
const historyModalSubtitle = document.getElementById('historyModalSubtitle')
const closeHistoryModalBtn = document.getElementById('closeHistoryModal')

let episExistentes = []
let editingEpiId = null

async function carregarEpis() {
    const token = localStorage.getItem('token')

    if (!token) {
        window.location.href = 'login.html'
        return
    }

    try {
        const response = await fetch(`${API_URL}/epis`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token')
                window.location.href = 'login.html'
                return
            }
            throw new Error('Falha ao carregar os EPIs')
        }

        const epis = await response.json()
        episExistentes = epis

        if (epiTable) {
            epiTable.innerHTML = ''

            epis.forEach(epi => {
                const dataCadastro = new Date(epi.dataCadastro || epi.createdAt)
                const formattedDateTime = dataCadastro.toLocaleDateString('pt-BR') + ' ' + dataCadastro.toLocaleTimeString('pt-BR')
                const formattedVencimento = epi.vencimento ? new Date(epi.vencimento).toLocaleDateString('pt-BR') : '-'
                
                epiTable.innerHTML += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${epi.id}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${epi.nome}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${epi.lote}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${epi.descricao || '-'}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${formattedVencimento}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${epi.initialQuantidade ?? epi.quantidade}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${epi.quantidade}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb;">${formattedDateTime}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e1e5eb; display:flex; gap: 6px; flex-wrap: wrap;">
                            <button type="button" class="btn btn-primary btn-history" data-id="${epi.id}"><i class="fas fa-history"></i></button>
                            <button type="button" class="btn btn-secondary btn-edit" data-id="${epi.id}"><i class="fas fa-edit"></i></button>
                            <button type="button" class="btn btn-secondary btn-delete" data-id="${epi.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `
            })
        }

        populateEpiNames(epis)
    } catch (error) {
        console.error(error)
    }
}

function resetForm() {
    editingEpiId = null
    epiForm.reset()
    cancelEditBtn.style.display = 'none'
    saveEpiBtn.textContent = 'Cadastrar EPI'
    nomeEpiInput.placeholder = 'Nome do EPI (escreva ou escolha sugestão)'
    loteEpiInput.placeholder = 'Lote'
    descricaoEpiInput.placeholder = 'Descrição'
}

function setEditMode(epi) {
    editingEpiId = epi.id
    nomeEpiInput.value = epi.nome
    loteEpiInput.value = epi.lote
    descricaoEpiInput.value = epi.descricao || ''
    quantidadeEpiInput.value = epi.quantidade
    vencimentoEpiInput.value = epi.vencimento ? new Date(epi.vencimento).toISOString().slice(0,10) : ''
    cancelEditBtn.style.display = 'inline-flex'
    saveEpiBtn.textContent = 'Atualizar EPI'
}

function handleTableClick(event) {
    const historyBtn = event.target.closest('.btn-history')
    const editBtn = event.target.closest('.btn-edit')
    const deleteBtn = event.target.closest('.btn-delete')

    if (historyBtn) {
        const id = Number(historyBtn.dataset.id)
        const epi = episExistentes.find(ep => ep.id === id)
        if (epi) {
            openHistoryModal(epi)
        }
        return
    }

    if (editBtn) {
        const id = Number(editBtn.dataset.id)
        const epi = episExistentes.find(ep => ep.id === id)
        if (epi) {
            setEditMode(epi)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        return
    }

    if (deleteBtn) {
        const id = Number(deleteBtn.dataset.id)
        const epi = episExistentes.find(ep => ep.id === id)
        if (!epi) return

        if (confirm(`Excluir EPI ${epi.nome} (lote ${epi.lote})?`)) {
            deleteEpi(id)
        }
    }
}

async function deleteEpi(id) {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            window.location.href = 'login.html'
            return
        }

        const response = await fetch(`${API_URL}/epis/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

            const respBody = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(respBody?.error || respBody?.message || 'Erro ao excluir EPI')
            }

        carregarEpis()
        if (editingEpiId === id) resetForm()
        alert('EPI excluído com sucesso!')
    } catch (error) {
        console.error(error)
        alert('Erro ao excluir EPI: ' + error.message)
    }
}

if (epiTable) {
    epiTable.addEventListener('click', handleTableClick)
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetForm)
}

if (closeHistoryModalBtn) {
    closeHistoryModalBtn.addEventListener('click', closeHistoryModal)
}

if (historyModalOverlay) {
    historyModalOverlay.addEventListener('click', (event) => {
        if (event.target === historyModalOverlay) {
            closeHistoryModal()
        }
    })
}

function openHistoryModal(epi) {
    historyModalSubtitle.textContent = `EPI: ${epi.nome} — Lote: ${epi.lote}`
    historyModalContent.innerHTML = '<p class="muted-text">Carregando histórico...</p>'
    historyModalOverlay.classList.remove('hidden')

    fetch(`${API_URL}/epis/${epi.id}/history`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Não foi possível carregar o histórico')
        }
        return response.json()
    })
    .then(history => {
        if (!history || history.length === 0) {
            historyModalContent.innerHTML = '<p class="muted-text">Nenhuma edição registrada para este EPI.</p>'
            return
        }

        historyModalContent.innerHTML = history.map(entry => {
            const when = new Date(entry.createdAt).toLocaleString('pt-BR')
            return `
                <article class="history-entry">
                    <div>
                        <strong>${entry.user?.name || 'Usuário ' + entry.userId}</strong>
                        <span class="history-date">${when}</span>
                    </div>
                    <div class="history-details">
                        <div><strong>Nome:</strong> ${entry.previousNome || '-'}</div>
                        <div><strong>Lote:</strong> ${entry.previousLote || '-'}</div>
                        <div><strong>Descrição:</strong> ${entry.previousDescricao || '-'}</div>
                        <div><strong>Quantidade:</strong> ${entry.previousQuantidade}</div>
                    </div>
                </article>
            `
        }).join('')
    })
    .catch(error => {
        console.error(error)
        historyModalContent.innerHTML = '<p class="muted-text">Erro ao carregar histórico. Tente novamente.</p>'
    })
}

function closeHistoryModal() {
    historyModalOverlay.classList.add('hidden')
}

function populateEpiNames(epis) {
    // cria lista única de nomes para sugestão
    const nomesUnicos = [...new Map(epis.map(e => [e.nome, e.nome])).values()]
    epiNamesList.innerHTML = ''
    nomesUnicos.forEach(nome => {
        const option = document.createElement('option')
        option.value = nome
        epiNamesList.appendChild(option)
    })
}

// quando usuário escolhe um nome sugerido, não bloqueamos campos; apenas preenchimento automático opcional
nomeEpiInput.addEventListener('input', (e) => {
    const val = e.target.value
    // se existir epi com mesmo nome, podemos sugerir lote/descrição preenchendo placeholders
    const match = episExistentes.find(ep => ep.nome.toLowerCase() === val.toLowerCase())
    if (match) {
        loteEpiInput.placeholder = `Sugestão de lote: ${match.lote}`
        descricaoEpiInput.placeholder = match.descricao || 'Descrição disponível'
    } else {
        loteEpiInput.placeholder = 'Lote'
        descricaoEpiInput.placeholder = 'Descrição'
    }
})

if (epiForm) {
    epiForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const nome = nomeEpiInput.value.trim()
        const lote = loteEpiInput.value.trim()
        const descricao = descricaoEpiInput.value.trim()

        if (!nome || !lote) {
            alert("Nome e Lote são obrigatórios")
            return
        }

        const loteExiste = episExistentes.some(ep => ep.lote.toLowerCase() === lote.toLowerCase() && ep.id !== editingEpiId)
        if (loteExiste) {
            alert("Esse lote já existe. Use outro lote ou atualize o registro existente.")
            return
        }

        const quantidade = parseInt(quantidadeEpiInput.value, 10)
        const vencimento = vencimentoEpiInput.value

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            alert("Quantidade deve ser um número inteiro maior que 0")
            return
        }

        try {
            const token = localStorage.getItem('token')

            if (!token) {
                window.location.href = 'login.html'
                return
            }

            const payload = {
                nome,
                lote,
                descricao,
                quantidade: Number(quantidade),
                vencimento: vencimento ? new Date(vencimento).toISOString() : null
            }

            const method = editingEpiId ? 'PUT' : 'POST'
            const url = editingEpiId ? `${API_URL}/epis/${editingEpiId}` : `${API_URL}/epis`

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.error || errorData?.message || 'Erro ao cadastrar EPI')
            }

            const wasEditing = Boolean(editingEpiId)
            resetForm()
            carregarEpis()
            alert(wasEditing ? 'EPI atualizado com sucesso!' : 'EPI cadastrado com sucesso!')

        } catch (error) {
            console.error(error)
            alert('Erro ao cadastrar EPI: ' + error.message)
        }
    })
}

carregarEpis()
