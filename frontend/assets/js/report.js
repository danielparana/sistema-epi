const employeeSelect = document.getElementById('reportEmployee')
const epiSelect = document.getElementById('reportEpi')
const reportResult = document.getElementById('reportResult')

const viewButton = document.getElementById('viewReport')

const periodStart = document.getElementById('periodStart')
const periodEnd = document.getElementById('periodEnd')

let employees = []
let epis = []

let currentReports = []

async function carregarPagina() {
  const token = localStorage.getItem('token')

  if (!token) {
    window.location.href = 'login.html'
    return
  }

  await Promise.all([
    carregarFuncionarios(),
    carregarEpis()
  ])
}

async function carregarFuncionarios() {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/employees`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    handleApiError(response)
    return
  }

  employees = await response.json()

  employeeSelect.innerHTML = '<option value="">Todos</option>'

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
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    handleApiError(response)
    return
  }

  epis = await response.json()

  epiSelect.innerHTML = '<option value="">Todos</option>'

  epis.forEach(epi => {
    const option = document.createElement('option')
    option.value = epi.id
    option.textContent = epi.nome
    epiSelect.appendChild(option)
  })
}

async function carregarRelatorio() {

    const token = localStorage.getItem('token')

    if (!token) {
        window.location.href = 'login.html'
        return
    }

    const params = new URLSearchParams()

    if (periodStart.value) {
        params.append('startDate', periodStart.value)
    }

    if (periodEnd.value) {
        params.append('endDate', periodEnd.value)
    }

    if (employeeSelect.value) {
        params.append('employeeId', employeeSelect.value)
    }

    if (epiSelect.value) {
        params.append('epiId', epiSelect.value)
    }

    console.log(params.toString())

    const response = await fetch(`${API_URL}/reports?${params.toString()}`, {

        headers: {
            Authorization: `Bearer ${token}`
        }

    })

    if (!response.ok) {
        handleApiError(response)
        return
    }

    currentReports = await response.json()

    console.log(currentReports)

    renderizarTabela(currentReports)

}

function renderizarTabela(reports) {

    if (reports.length === 0) {

        reportResult.innerHTML = `
            <p>Nenhum registro encontrado.</p>
        `

        return
    }

    let html = `
        <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">

        <table class="table min-w-full divide-y divide-slate-200">

        <thead class="bg-slate-100">

        <tr>

        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
        Data
        </th>

        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
        Funcionário
        </th>

        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
        EPI
        </th>

        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
        Lote
        </th>

        <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
        Quantidade
        </th>

        </tr>

        </thead>

        <tbody class="divide-y divide-slate-200 bg-white">
        `;

    reports.forEach(report => {

        const data = new Date(report.dataEntrega)

        html += `
            <tr class="hover:bg-slate-50 transition">

            <td class="px-4 py-3">
            ${data.toLocaleDateString('pt-BR')}
            </td>

            <td class="px-4 py-3">
            ${report.employee.nome}
            </td>

            <td class="px-4 py-3 font-medium">
            ${report.epi.nome}
            </td>

            <td class="px-4 py-3">
            ${report.epi.lote}
            </td>

            <td class="px-4 py-3 text-center">
            ${report.quantidade}
            </td>

            </tr>
            `;

    })

    html += `
            </tbody>
            </table>
        </table>
    `;

    reportResult.innerHTML = html

}

function handleApiError(response) {
  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = 'login.html'
  }
}

if (viewButton) {
    viewButton.addEventListener('click', carregarRelatorio)
}

document.getElementById('generateXlsx').addEventListener('click', function () {

    if (!currentReports || currentReports.length === 0) {
        alert('Nenhum relatório para exportar')
        return
    }

    const table = document.querySelector('.table')

    if (!table) {
        alert('Gere o relatório primeiro')
        return
    }

    const wb = XLSX.utils.table_to_book(table, { sheet: "Relatório" })
    XLSX.writeFile(wb, "relatorio-epis.xlsx")
})

document.getElementById('generatePdf').addEventListener('click', function () {

    if (!currentReports || currentReports.length === 0) {
        alert('Nenhum relatório para exportar')
        return
    }

    const { jsPDF } = window.jspdf
    const doc = new jsPDF()

    const table = document.querySelector('.table')

    if (!table) {
        alert('Gere o relatório primeiro')
        return
    }

    doc.text("Relatório de EPIs", 14, 15)

    doc.autoTable({
        html: table,
        startY: 25,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [47, 62, 70] }
    })

    doc.save("relatorio-epis.pdf")
})

carregarPagina()