const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  const passwordHash = await bcrypt.hash('123456', 10)

  // =========================
  // LIMPA BANCO
  // =========================
  await prisma.delivery.deleteMany()
  await prisma.epi.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.user.deleteMany()

  // =========================
  // USERS
  // =========================
  const admin = await prisma.user.create({
    data: {
      name: "Fabrício",
      email: "fabricio@email.com",
      passwordHash,
      role: "ADMIN"
    }
  })

  const gerente = await prisma.user.create({
    data: {
      name: "Carlos Henrique",
      email: "gerente@email.com",
      passwordHash,
      role: "GERENTE"
    }
  })

  const funcionarioUser = await prisma.user.create({
    data: {
      name: "João da Silva",
      email: "funcionario@email.com",
      passwordHash,
      role: "FUNCIONARIO"
    }
  })

  // =========================
  // EMPLOYEES
  // =========================
  const employees = await Promise.all([
    prisma.employee.create({ data: { nome: "João da Silva", cpf: "52998224725", cargo: "Operador CNC" } }),
    prisma.employee.create({ data: { nome: "Pedro Souza", cpf: "39053344705", cargo: "Soldador" } }),
    prisma.employee.create({ data: { nome: "Carlos Lima", cpf: "16899535009", cargo: "Supervisor" } }),
    prisma.employee.create({ data: { nome: "Lucas Ferreira", cpf: "11144477735", cargo: "Eletricista" } }),
    prisma.employee.create({ data: { nome: "Marcos Vinicius", cpf: "98765432100", cargo: "Almoxarife" } })
  ])

  // vínculo user <-> employee
  await prisma.user.update({
    where: { id: funcionarioUser.id },
    data: {
      employeeId: employees[0].id
    }
  })

  // =========================
  // EPIs
  // =========================
  const epis = await Promise.all([
    prisma.epi.create({ data: { nome: "Capacete", lote: "L001", quantidade: 10, initialQuantidade: 10 } }),
    prisma.epi.create({ data: { nome: "Óculos", lote: "L002", quantidade: 10, initialQuantidade: 10 } })
  ])

  console.log("✅ Seed finalizado!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })