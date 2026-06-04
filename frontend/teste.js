import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Adicione esta linha para criar a instância do cliente:
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando testes no banco com JavaScript...')

  // 1. Criar um funcionário de teste
  const funcionario = await prisma.employee.create({
    data: {
      nome: 'Carlos Souza',
      cpf: '987.654.321-11',
      cargo: 'Almoxarife',
    },
  })
  console.log('✅ Funcionário criado:', funcionario.nome)

  // 2. Criar um EPI de teste
  const epi = await prisma.epi.create({
    data: {
      nome: 'Óculos de Proteção Escuro',
      lote: 'LOTE-2026-ABC',
      quantidade: 30,
      validade: new Date('2027-06-01'),
    },
  })
  console.log('✅ EPI criado:', epi.nome)

  // 3. Registrar a entrega relacionando os dois IDs
  const entrega = await prisma.delivery.create({
    data: {
      employeeId: funcionario.id,
      epiId: epi.id,
      quantidade: 2,
    },
  })
  console.log('📦 Entrega registrada com sucesso! ID:', entrega.id)

  // 4. Buscar os dados trazendo os relacionamentos (JOIN automático)
  const todasAsEntregas = await prisma.delivery.findMany({
    include: {
      employee: true, 
      epi: true,      
    },
  })

  console.log('\n📊 Relatório de Entregas no Banco (JS):')
  console.dir(todasAsEntregas, { depth: null })
}

main()
  .catch((e) => {
    console.error('❌ Erro no teste:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })