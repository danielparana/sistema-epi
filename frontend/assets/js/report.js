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
        <table class="table">

            <thead>

                <tr>
                    <th>Data</th>
                    <th>Funcionário</th>
                    <th>EPI</th>
                    <th>Lote</th>
                    <th>Quantidade</th>
                </tr>

            </thead>

            <tbody>
    `

    reports.forEach(report => {

        const data = new Date(report.dataEntrega)

        html += `
            <tr>

                <td>
                    ${data.toLocaleDateString('pt-BR')}
                </td>

                <td>
                    ${report.employee.nome}
                </td>

                <td>
                    ${report.epi.nome}
                </td>

                <td>
                    ${report.epi.lote}
                </td>

                <td>
                    ${report.quantidade}
                </td>

            </tr>
        `

    })

    html += `
            </tbody>
        </table>
    `

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