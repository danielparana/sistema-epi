const prisma = require('../prisma/client')

class EmployeeController {
  async list(req, res) {

    try {

        const page = Math.max(parseInt(req.query.page) || 1, 1);

        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || 5, 1),
            100
        );

        const search = (req.query.search || '').trim();

        const skip = (page - 1) * limit;

        const where = {
            active: true
        };

        if (search) {
            where.OR = [
                {
                    nome: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    cpf: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        const [employees, totalRecords] = await Promise.all([

            prisma.employee.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    id: 'asc'
                }
            }),

            prisma.employee.count({
                where
            })

        ]);

        const totalPages = Math.ceil(totalRecords / limit);

        return res.json({
            data: employees,
            meta: {
                totalRecords,
                currentPage: page,
                totalPages,
                limit,
                search
            }
        });

    } catch (error) {

        console.error('Erro ao listar funcionários:', error);

        return res.status(500).json({
            error: 'Erro ao listar funcionários'
        });
    }
}

  async create(req, res) {
    const { nome, cpf, cargo } = req.body

    if (!nome || !cpf || !cargo) {
      return res.status(400).json({ error: 'Nome, CPF e cargo são obrigatórios' })
    }

    try {
      const employeeExists = await prisma.employee.findUnique({
        where: {
          cpf
        }
      })

      if (employeeExists) {
        return res.status(400).json({ error: 'CPF já cadastrado' })
      }

      const employee = await prisma.employee.create({
        data: {
          nome,
          cpf,
          cargo
        }
      })
     
      return res.status(201).json({
        message: 'Funcionário cadastrado',
        employee
      })
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao cadastrar funcionário' })
    }
  }

  // UPDATE (ADMIN + GERENTE)
async update(req, res) {
  const { id } = req.params
  const { nome, cpf, cargo } = req.body

  try {
    const employee = await prisma.employee.update({
      where: { id: Number(id) },
      data: {
        nome,
        cpf,
        cargo
      }
    })

    return res.json(employee)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar funcionário' })
  }
}

// DELETE = DESATIVAR (soft delete)
async delete(req, res) {
  const { id } = req.params

  try {
    const employee = await prisma.employee.update({
      where: { id: Number(id) },
      data: {
        active: false
      }
    })

    return res.json({ message: 'Funcionário desativado com sucesso' })
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao desativar funcionário' })
  }
}

}

module.exports = new EmployeeController()