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
    const hoje = new Date();
    const dias30 = new Date();
    dias30.setDate(hoje.getDate() + 30);
    
    // Ajustar para comparar apenas as datas 
    hoje.setHours(0, 0, 0, 0);
    dias30.setHours(23, 59, 59, 999);
    
    // 1. Total de EPIs em estoque 
    const estoqueTotal = await prisma.epi.aggregate({ 
      _sum: { quantidade: true } 
    });
    
    // 2. Total de funcionários cadastrados
    const totalFuncionarios = await prisma.employee.count();
    
    // 3. EPIs próximos do vencimento (próximos 30 dias)
    const proximosVencimento = await prisma.epi.count({
      where: {
        vencimento: {
          gte: hoje,
          lte: dias30
        },
        quantidade: {
          gt: 0
        }
      }
    });
    
    // 4. EPIs vencidos
    const vencidos = await prisma.epi.count({
      where: {
        vencimento: {
          lt: hoje
        },
        quantidade: {
          gt: 0
        }
      }
    });
    
    // 5. Buscar alertas reais (EPIs próx a vencer e vencidos)
    const episAlerta = await prisma.epi.findMany({
      where: {
        OR: [
          {
            vencimento: {
              lte: dias30
            }
          },
          {
            vencimento: {
              lt: hoje
            }
          }
        ],
        quantidade: {
          gt: 0
        }
      },
      orderBy: {
        vencimento: 'asc'
      },
      take: 10
    });
    
    
    const alertas = episAlerta.map(epi => {
      const diasParaVencer = Math.ceil((new Date(epi.vencimento) - hoje) / (1000 * 60 * 60 * 24));
      let tipo = 'warning';
      let texto = '';
      
      if (diasParaVencer < 0) {
        tipo = 'danger';
        texto = `${epi.nome} - Lote ${epi.lote} está VENCIDO!`;
      } else if (diasParaVencer === 0) {
        tipo = 'danger';
        texto = `${epi.nome} - Lote ${epi.lote} vence HOJE!`;
      } else if (diasParaVencer <= 5) {
        tipo = 'danger';
        texto = `${epi.nome} - Lote ${epi.lote} vence em ${diasParaVencer} dias (URGENTE!)`;
      } else {
        tipo = 'warning';
        texto = `${epi.nome} - Lote ${epi.lote} vence em ${diasParaVencer} dias`;
      }
      
      return { id: epi.id, tipo, texto };
    });
    
    // Se não houver alertas, adicionar uma mensagem informativa
    if (alertas.length === 0) {
      alertas.push({
        id: 0,
        tipo: 'info',
        texto: 'Nenhum EPI próximo do vencimento ou vencido!'
      });
    }
    
    res.json({
      estoque: estoqueTotal._sum.quantidade || 0,
      funcionarios: totalFuncionarios,
      proximosVencimento: proximosVencimento,
      vencidos: vencidos,
      alertas: alertas
    });
    
  } catch (error) {
    console.error('Erro no dashboard:', error);
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
    // Verificar se o EPI tem quantidade suficiente
    const epi = await prisma.epi.findUnique({
      where: { id: parseInt(epiId) }
    });
    
    if (!epi) {
      return res.status(404).json({ error: 'EPI não encontrado' });
    }
    
    if (epi.quantidade < parseInt(quantidade)) {
      return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
    }
    
    // Criar a entrega
    const novaEntrega = await prisma.delivery.create({
      data: {
        employeeId: parseInt(employeeId),
        epiId: parseInt(epiId),
        quantidade: parseInt(quantidade),
        dataEntrega: new Date()
      },
      include: { employee: true, epi: true }
    });
    
    // Atualizar a quantidade do EPI (diminuir do estoque)
    await prisma.epi.update({
      where: { id: parseInt(epiId) },
      data: {
        quantidade: epi.quantidade - parseInt(quantidade)
      }
    });
    
    res.status(201).json(novaEntrega);
  } catch (error) {
    console.error('Erro ao registrar entrega:', error);
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

app.get('/api/auth/me', async (req, res) => {
  
  res.json({
    id: 1,
    name: "Administrador",
    email: "admin@exemplo.com",
    role: "Administrador"
  });
});

app.listen(3000, () => {
  console.log('API do EPI Fácil rodando na porta 3000');
});