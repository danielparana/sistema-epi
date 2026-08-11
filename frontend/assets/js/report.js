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

function handleApiError(response) {
    if (response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = 'login.html'
    }
}

async function carregarFuncionarios() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) { handleApiError(response); return; }

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
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) { handleApiError(response); return; }

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
    if (!token) { window.location.href = 'login.html'; return; }

    const params = new URLSearchParams()
    if (periodStart.value) params.append('startDate', periodStart.value)
    if (periodEnd.value) params.append('endDate', periodEnd.value)
    if (employeeSelect.value) params.append('employeeId', employeeSelect.value)
    if (epiSelect.value) params.append('epiId', epiSelect.value)

    const viewBtnOriginal = viewButton.innerHTML;
    viewButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Buscando...';
    viewButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/reports?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        viewButton.disabled = false;
        viewButton.innerHTML = viewBtnOriginal;

        if (!response.ok) { handleApiError(response); return; }

        currentReports = await response.json()
        renderizarTabela(currentReports)
    } catch (error) {
        console.error(error);
        viewButton.disabled = false;
        viewButton.innerHTML = viewBtnOriginal;
        reportResult.innerHTML = `<div class="p-6 text-center text-red-500 bg-red-50 rounded-lg border border-red-100">Erro de conexão ao gerar relatório.</div>`;
    }
}

function renderizarTabela(reports) {
    if (reports.length === 0) {
        reportResult.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 px-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500">
                <i class="fa-solid fa-folder-open text-4xl text-slate-300 mb-3"></i>
                <p class="text-sm font-medium">Nenhum registro encontrado para estes filtros.</p>
            </div>
        `
        return
    }

    // Estrutura Base (Contêiner Blindado ajustado para lg)
    let html = `
        <div class="w-full overflow-x-hidden lg:overflow-x-auto rounded-lg lg:border lg:border-slate-200 lg:shadow-sm">
            <table class="w-full text-left border-collapse lg:min-w-[800px] lg:whitespace-nowrap block lg:table">
                <thead class="hidden lg:table-header-group bg-slate-800 text-white">
                    <tr>
                        <th class="p-4 text-sm font-semibold tracking-wide">Data</th>
                        <th class="p-4 text-sm font-semibold tracking-wide">Funcionário</th>
                        <th class="p-4 text-sm font-semibold tracking-wide">EPI</th>
                        <th class="p-4 text-sm font-semibold tracking-wide">Lote</th>
                        <th class="p-4 text-sm font-semibold tracking-wide text-center">Quantidade</th>
                    </tr>
                </thead>
                <tbody class="block lg:table-row-group lg:divide-y lg:divide-slate-200 bg-transparent lg:bg-white w-full">
    `;

    // Classes Responsivas ajustadas para lg
    const trClass = "flex flex-col lg:table-row bg-white border border-slate-200 lg:border-0 lg:border-b lg:border-slate-200 rounded-xl lg:rounded-none shadow-sm lg:shadow-none mb-4 lg:mb-0 hover:bg-slate-50 transition-colors overflow-hidden w-full";
    const tdClass = "p-4 lg:py-3 lg:px-4 text-sm text-slate-700 flex justify-between lg:table-cell items-center border-b border-slate-100 lg:border-0 last:border-0 w-full min-w-0";
    const labelClass = "lg:hidden font-semibold text-slate-900 shrink-0 mr-4";

    reports.forEach(report => {
        // Fallbacks de segurança
        const dataObj = report.dataEntrega ? new Date(report.dataEntrega) : new Date();
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const funcNome = report.employee?.nome || 'Não identificado';
        const epiNome = report.epi?.nome || 'Não identificado';
        const lote = report.epi?.lote || '-';
        const qtd = report.quantidade || 0;

        html += `
            <tr class="${trClass}">
                <td class="${tdClass}">
                    <span class="${labelClass}">Data</span>
                    <span class="text-slate-900 font-medium lg:font-normal">${dataFormatada}</span>
                </td>
                <td class="${tdClass}">
                    <span class="${labelClass}">Funcionário</span>
                    <strong class="text-slate-900 lg:font-normal text-right truncate ml-auto max-w-[65%] lg:max-w-none" title="${funcNome}">${funcNome}</strong>
                </td>
                <td class="${tdClass}">
                    <span class="${labelClass}">EPI</span>
                    <span class="text-right truncate ml-auto max-w-[65%] lg:max-w-none" title="${epiNome}">${epiNome}</span>
                </td>
                <td class="${tdClass}">
                    <span class="${labelClass}">Lote</span>
                    <span class="bg-slate-100 text-slate-700 py-1 px-3 rounded-md text-xs font-medium border border-slate-200 ml-auto truncate max-w-[50%] lg:max-w-none">${lote}</span>
                </td>
                <td class="${tdClass} lg:text-center">
                    <span class="${labelClass}">Quantidade</span>
                    <span class="font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-md border border-brand-100 ml-auto lg:mx-auto">${qtd}</span>
                </td>
            </tr>
        `;
    })

    html += `
                </tbody>
            </table>
        </div>
    `;

    reportResult.innerHTML = html
}

if (viewButton) {
    viewButton.addEventListener('click', carregarRelatorio)
}

// ==========================================
// EXPORTAÇÃO BLINDADA (Lendo JSON, não DOM)
// ==========================================
document.getElementById('generateXlsx').addEventListener('click', function () {
    if (!currentReports || currentReports.length === 0) {
        alert('Gere um relatório com resultados antes de exportar.')
        return
    }

    // Mapeamento direto da memória para o formato Excel
    const dataForExcel = currentReports.map(report => ({
        "Data": report.dataEntrega ? new Date(report.dataEntrega).toLocaleDateString('pt-BR') : '-',
        "Funcionário": report.employee?.nome || 'Não identificado',
        "EPI": report.epi?.nome || 'Não identificado',
        "Lote": report.epi?.lote || '-',
        "Quantidade": report.quantidade || 0
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório EPIs");
    
    // Auto-ajuste de colunas simples
    const wscols = [ {wch:12}, {wch:35}, {wch:40}, {wch:15}, {wch:12} ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, "relatorio-epis.xlsx")
})

document.getElementById('generatePdf').addEventListener('click', function () {
    if (!currentReports || currentReports.length === 0) {
        alert('Gere um relatório com resultados antes de exportar.')
        return
    }

    const { jsPDF } = window.jspdf
    const doc = new jsPDF()

    // Mapeamento de Arrays para o AutoTable
    const tableBody = currentReports.map(report => [
        report.dataEntrega ? new Date(report.dataEntrega).toLocaleDateString('pt-BR') : '-',
        report.employee?.nome || 'Não identificado',
        report.epi?.nome || 'Não identificado',
        report.epi?.lote || '-',
        report.quantidade || 0
    ]);

    doc.text("Relatório de Entregas de EPIs", 14, 15)
    doc.setFontSize(10);
    doc.text(`Período gerado: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);

    doc.autoTable({
        head: [['Data', 'Funcionário', 'EPI', 'Lote', 'Qtd']],
        body: tableBody,
        startY: 28,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [13, 84, 180] }, // Usando o azul da marca (brand-500)
        alternateRowStyles: { fillColor: [248, 250, 252] }
    })

    doc.save("relatorio-epis.pdf")
})

carregarPagina()