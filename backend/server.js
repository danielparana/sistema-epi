import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());


app.get('/api/dashboard', async (req, res) => {
  try {
    const estoqueTotal = await prisma.epi.aggregate({ _sum: { quantidade: true } });
    const totalEntregas = await prisma.delivery.count();


    const alertas = [
      { id: 1, tipo: 'warning', texto: 'Luvas De Segurança Térmica Tátil Foam Ca 51248 Volkh vence em 5 dias' },
      { id: 2, tipo: 'danger', texto: 'Oculos de Solda Epi Mascara Articulavel Dupla Lente Soldador vence hoje' },
      { id: 3, tipo: 'warning', texto: 'Máscara Facial Respirador C/ Filtro Alltec Mastt 2001 Vo/ga' }
    ];

    res.json({
      estoque: estoqueTotal._sum.quantidade || 0,
      emUso: totalEntregas,
      proximosVencimento: 120,
      alertas
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/funcionarios', async (req, res) => {
  try {
    const funcionarios = await prisma.employee.findMany({ orderBy: { nome: 'asc' } });
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/funcionarios', async (req, res) => {
  const { nome, cpf, cargo } = req.body;
  try {
    const novoFuncionario = await prisma.employee.create({
      data: { nome, cpf, cargo }
    });
    res.status(201).json(novoFuncionario);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao cadastrar funcionário. Verifique se o CPF é único.' });
  }
});


app.get('/api/epis', async (req, res) => {
  try {
    const epis = await prisma.epi.findMany({ orderBy: { nome: 'asc' } });
    res.json(epis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/entregas', async (req, res) => {
  const { employeeId, epiId, quantidade } = req.body;
  try {
    const novaEntrega = await prisma.delivery.create({
      data: {
        employeeId: parseInt(employeeId),
        epiId: parseInt(epiId),
        quantidade: parseInt(quantidade),
        dataEntrega: new Date()
      },
      include: { employee: true, epi: true }
    });
    res.status(201).json(novaEntrega);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao registrar entrega. Certifique-se de preencher todos os campos.' });
  }
});


app.get('/api/entregas', async (req, res) => {
  try {
    const entregas = await prisma.delivery.findMany({
      include: { employee: true, epi: true },
      orderBy: { dataEntrega: 'desc' }
    });
    res.json(entregas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('API do EPI Fácil rodando na porta 3000');
});