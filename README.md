# Sistema EPI

**Versão atual:** 2.0

Sistema EPI é uma aplicação de controle de equipamentos de proteção individual (EPIs) com backend em Node.js, Express e Prisma, e frontend em páginas estáticas HTML/JavaScript.

## Visão Geral

O sistema permite:
* Autenticação de usuários com JWT
* Cadastro de funcionários
* Cadastro e atualização de EPIs
* Controle de estoque e entrega de EPIs
* Histórico de edição de EPIs

## Estrutura do Repositório

```bash
sistema-epi/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── prisma/
│   │   ├── routes/
│   │   └── index.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   └── js/
│   ├── dashboard.html
│   ├── entregas.html
│   ├── epis.html
│   ├── funcionarios.html
│   ├── index.html
│   ├── login.html
│   └── relatorios.html
└── package.json
```

## Tecnologias

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* JWT
* bcryptjs
* dotenv
* CORS
* Nodemon

## Requisitos

* Node.js 18+ (ou compatível)
* npm
* PostgreSQL

## Setup do Backend

1. Abra um terminal e entre na pasta do backend:

```bash
cd backend
```

2. Instale dependências:

```bash
npm install
```

3. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

4. Edite `backend/.env` com os dados reais do banco de dados:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/postgres"
JWT_SECRET="seuSegredoJWT"
```

5. Execute as migrations e gere o Prisma Client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. Inicie o servidor:

```bash
npm run dev
```

O servidor deve ficar disponível em `http://localhost:3000`.

## Setup do Frontend

O frontend é composto por páginas estáticas em `frontend/`.

1. Abra `frontend/index.html` em um navegador ou sirva a pasta `frontend/` com um servidor estático.
2. O arquivo `frontend/assets/js/api.js` define a variável `API_URL`.
3. Se estiver usando o backend local, ele já aponta para `http://localhost:3000`.
4. Se for usar um domínio remoto, atualize `API_URL` adequadamente.

## Rotas da API

### Autenticação

#### POST /auth/login

Request:
```json
{
	"email": "usuario@exemplo.com",
	"password": "senha123"
}
```

Response:
```json
{
	"message": "Login realizado",
	"token": "TOKEN_JWT"
}
```

#### GET /auth/me
Requer header `Authorization: Bearer TOKEN_JWT`.

Response:
```json
{
	"id": 1,
	"name": "Usuário",
	"email": "usuario@exemplo.com"
}
```

### Usuários

#### POST /users
Cria um novo usuário.

Request:
```json
{
	"name": "Nome",
	"email": "email@exemplo.com",
	"password": "senha123"
}
```

### Funcionários

As rotas de funcionários são protegidas por JWT.

#### GET /employees
Lista todos os funcionários.

#### POST /employees
Cria funcionário.

Request:
```json
{
	"nome": "João",
	"cpf": "12345678900",
	"cargo": "Técnico"
}
```

### EPIs

As rotas de EPIs também são protegidas.

#### GET /epis
Lista todos os EPIs.

#### POST /epis
Cria um novo EPI.

Request:
```json
{
	"nome": "Capacete",
	"lote": "L001",
	"quantidade": 10,
	"descricao": "Capacete de segurança",
	"vencimento": "2026-12-31"
}
```

#### PUT /epis/:id
Atualiza um EPI.

#### DELETE /epis/:id
Remove um EPI sem entregas registradas.

#### GET /epis/:id/history
Retorna o histórico de edições do EPI.

### Entregas

#### GET /deliveries
Lista todas as entregas.

#### POST /deliveries
Registra uma nova entrega e reduz o estoque do EPI.

Request:
```json
{
	"employeeId": 1,
	"epiId": 2,
	"quantidade": 3
}
```

### Dashboard

#### GET /dashboard
Requer autenticação e retorna estatísticas básicas.

Response exemplo:
```json
{
	"totalEpis": 15,
	"totalFuncionarios": 5,
	"totalEntregas": 8,
	"proximosVencimento": 0,
	"vencidos": 0
}
```

## Modelos de Dados

### User
* `id`
* `name`
* `email`
* `passwordHash`

### Employee
* `id`
* `nome`
* `cpf`
* `cargo`

### Epi
* `id`
* `nome`
* `lote`
* `descricao`
* `quantidade`
* `initialQuantidade`
* `vencimento`

### Delivery
* `id`
* `employeeId`
* `epiId`
* `quantidade`
* `dataEntrega`

### EpiHistory
* `id`
* `epiId`
* `userId`
* `previousNome`
* `previousLote`
* `previousDescricao`
* `previousQuantidade`
* `createdAt`

## Variáveis de Ambiente

* `DATABASE_URL` - string de conexão do PostgreSQL
* `JWT_SECRET` - segredo usado para assinar tokens JWT

## Solução de Problemas

* `500 Internal Server Error` no login geralmente indica configuração incorreta do `.env` ou conexão inválida ao banco de dados.
* Verifique se `backend/.env` existe e contém `DATABASE_URL` e `JWT_SECRET` válidos.
* Reinicie o backend após alterações em `.env`.

## Observações

* O arquivo `frontend/assets/js/api.js` define a URL do backend.
* As rotas `/employees`, `/epis`, `/deliveries` e `/dashboard` exigem o token JWT no header `Authorization`.

---

# Novidades da Versão 2.0

A Versão 2.0 consolida as funcionalidades desenvolvidas pela equipe e apresenta melhorias implementadas durante a fase de integração do projeto.

 ## Melhorias implementadas
Dashboard reformulado com novos indicadores visuais.
- Inclusão de painéis para:
 - EPIs em Estoque
 - Funcionários Cadastrados
 - EPIs Próximos do Vencimento
 - EPIs Vencidos
- Melhorias na interface da tela de Funcionários.
- Ajustes de layout e organização das páginas.
- Correções realizadas durante o processo de integração (Merge) entre as funcionalidades desenvolvidas pela equipe.
- Atualização da documentação do projeto.
- Credenciais para Testes

## Credenciais para Testes
Para acessar o sistema durante os testes, utilize as seguintes credenciais:

**E-mail**

'fabricio@email.com'

**Senha**

'123456'

> Essas credenciais são destinadas apenas para testes e desenvolvimento da aplicação.

---

## Configuração do Banco de Dados (Equipe)

O projeto utiliza um banco de dados PostgreSQL hospedado no Supabase, compartilhado entre os integrantes da equipe para desenvolvimento e testes.

Por motivos de segurança, como este repositório é público, as credenciais de acesso ao banco não são armazenadas no GitHub.

Cada integrante deverá:

Copiar o arquivo .env.example;
Renomeá-lo para .env;
Inserir a DATABASE_URL e demais configurações fornecidas pela equipe.

A DATABASE_URL e outras credenciais deverão ser compartilhadas apenas entre os integrantes do grupo por um canal privado (WhatsApp, Discord ou outro meio acordado pela equipe).

## Orientações para Desenvolvimento

Antes de iniciar qualquer alteração no projeto, atualize sua cópia local:

git pull origin main

Após concluir uma funcionalidade:

git add .
git commit -m "Descrição da alteração"
git push origin main

Caso ocorram conflitos durante um merge, resolva todos os conflitos antes de realizar um novo commit.

Observações
O sistema foi desenvolvido para fins acadêmicos.
O banco de dados compartilhado é destinado exclusivamente para desenvolvimento e testes da equipe.
Evite alterar ou excluir registros utilizados por outros integrantes sem alinhamento prévio.
Sempre mantenha seu repositório atualizado antes de iniciar novas implementações.
Histórico de Versões
Versão 2.0
Integração das funcionalidades desenvolvidas pela equipe.
Dashboard atualizado com novos indicadores.
Melhorias na interface do sistema.
Ajustes na tela de Funcionários.
Correções realizadas após o processo de Merge.
Atualização da documentação do projeto.

## Licença

MIT
