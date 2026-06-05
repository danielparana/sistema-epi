const deliveryForm = document.getElementById('deliveryForm')
const employeeSelect = document.getElementById('employeeSelect')
const epiSelect = document.getElementById('epiSelect')
const loteField = document.getElementById('selectedLot')
const stockField = document.getElementById('stockInfo')
const quantityInput = document.getElementById('quantityInput')
const deliveryTable = document.getElementById('deliveryTable')

let employees = []
let epis = []

async function carregarEntregas() {
  const token = localStorage.getItem('token')

  if (!token) {
    window.location.href = 'login.html'
    return
  }

  await Promise.all([carregarFuncionarios(), carregarEpis(), carregarTabelaEntregas()])
}

async function carregarFuncionarios() {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_URL}/employees`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!response.ok) {
    handleApiError(response)
    return
  }

  employees = await response.json()
  employeeSelect.innerHTML = '<option value="">Selecione o funcionário</option>'

  employees.forEach(employee => {
    const option = document.createElement('option')
    option.value = employee.id
    option.textContent = employee.nome
    employeeSelect.appendChild(option)
  })
}

async function carregarEpis() {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_URL}/epis`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!response.ok) {
    handleApiError(response)
    return
  }

  epis = await response.json()
  epiSelect.innerHTML = '<option value="">Selecione o EPI</option>'

  epis.forEach(epi => {
    const option = document.createElement('option')
    option.value = epi.id
    option.textContent = `${epi.nome} - Lote ${epi.lote} (Estoque ${epi.quantidade})`
    epiSelect.appendChild(option)
  })
}

async function carregarTabelaEntregas() {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_URL}/deliveries`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!response.ok) {
    handleApiError(response)
    return
  }

  const deliveries = await response.json()
  deliveryTable.innerHTML = ''

  deliveries.forEach(delivery => {
    const createdAt = new Date(delivery.dataEntrega || delivery.createdAt)
    const formattedDate = `${createdAt.toLocaleDateString('pt-BR')} ${createdAt.toLocaleTimeString('pt-BR')}`
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${delivery.id}</td>
      <td>${delivery.employee.nome}</td>
      <td>${delivery.epi.nome}</td>
      <td>${delivery.epi.lote}</td>
      <td>${delivery.quantidade}</td>
      <td>${formattedDate}</td>
    `
    deliveryTable.appendChild(row)
  })
}

function handleApiError(response) {
  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = 'login.html'
  }
}

function atualizarInfoEpi() {
  const epiId = Number(epiSelect.value)
  const epi = epis.find(item => item.id === epiId)

  if (epi) {
    loteField.value = epi.lote
    stockField.textContent = `Estoque atual: ${epi.quantidade}`
  } else {
    loteField.value = ''
    stockField.textContent = ''
  }
}

if (epiSelect) {
  epiSelect.addEventListener('change', atualizarInfoEpi)
}

if (deliveryForm) {
  deliveryForm.addEventListener('submit', async event => {
    event.preventDefault()

    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = 'login.html'
      return
    }

    const employeeId = employeeSelect.value
    const epiId = epiSelect.value
    const quantidade = Number(quantityInput.value)

    if (!employeeId || !epiId || !quantidade || quantidade <= 0) {
      alert('Preencha funcionário, EPI e quantidade válidos')
      return
    }

    try {
      const response = await fetch(`${API_URL}/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ employeeId, epiId, quantidade })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Erro ao registrar entrega')
      }

      employeeSelect.value = ''
      epiSelect.value = ''
      quantityInput.value = 1
      loteField.value = ''
      stockField.textContent = ''
      carregarEntregas()
      alert('Entrega registrada com sucesso!')
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  })
}

carregarEntregas()
