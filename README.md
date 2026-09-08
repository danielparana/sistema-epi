# Sistema EPI Fácil
![Node.js](https://shields.io)
![Express](https://shields.io)
![Prisma](https://shields.io)
![PostgreSQL](https://shields.io)
![Tailwind CSS](https://shields.io)
![JavaScript](https://shields.io)

**Versão atual:** 3.0

Sistema EPI é uma aplicação de controle de equipamentos de proteção individual (EPIs) com backend em Node.js, Express e Prisma, e frontend em páginas estáticas HTML/JavaScript.


## Visão Geral

# ✨ Principais Funcionalidades

## 🔐 Autenticação

- Login utilizando JWT
- Controle de acesso por perfil
- Sessões protegidas

- <img width="1359" height="677" alt="image" src="https://github.com/user-attachments/assets/8d2f9ec4-d941-4bfc-aaa9-a9e141e06755" />


---

## 👥 Funcionários

- Cadastro
- Alteração
- Exclusão
- Consulta
- <img width="1360" height="687" alt="image" src="https://github.com/user-attachments/assets/e300bdfa-3eac-49f6-af6f-c2bae2ce001c" />


---

## 🦺 EPIs

- Cadastro de equipamentos
- Controle de estoque
- Controle por lote
- Controle de validade
- Atualização automática do estoque após entregas
- <img width="1361" height="686" alt="image" src="https://github.com/user-attachments/assets/23528979-b062-4b63-87c7-d98bbe301afc" />


---

## 📦 Entregas

- Registro de entrega de EPIs
- Histórico completo
- Controle de quantidade entregue
- <img width="1362" height="686" alt="image" src="https://github.com/user-attachments/assets/27142789-7bd9-42d9-a6c1-6a9bf30a7daa" />


---

## 📊 Dashboard Inteligente

O Dashboard apresenta indicadores em tempo real:

- 📦 Estoque Total
- 🔴 EPIs vencidos
- 🟠 EPIs próximos do vencimento (até 30 dias)
- 🟡 EPIs em atenção (30 a 45 dias)
- 🟢 EPIs dentro da validade

Também apresenta:

- Lista dos EPIs em estoque
- Lista de alertas
- Indicadores visuais por cores
- Interface responsiva
- <img width="1361" height="687" alt="image" src="https://github.com/user-attachments/assets/cc2b6aa6-a823-4559-9275-610cc2701f07" />


---

## 🚨 Sistema Inteligente de Alertas

O sistema monitora automaticamente a validade dos EPIs.

Os equipamentos são classificados em quatro níveis:

🔴 Vencido

🟠 Até 30 dias

🟡 Entre 30 e 45 dias

🟢 Acima de 45 dias

Cada alerta apresenta:

- Nome do EPI
- Lote
- Quantidade
- Data de validade
- Dias restantes para vencimento
- Funcionários que receberam aquele lote
- Data da entrega para cada funcionário
- <img width="1348" height="656" alt="image" src="https://github.com/user-attachments/assets/a8674356-a95f-4f2d-8a9d-16bd6c32c427" />


---

## 🔔 Pop-up Inteligente

Ao acessar o sistema, o usuário recebe um lembrete automático caso existam EPIs que necessitem atenção.

O pop-up é exibido somente quando houver:

- EPIs vencidos
- EPIs próximos do vencimento
- EPIs em atenção

Os lembretes estão programados para ocorrer diariamente nos períodos:

- 08:00
- 11:40
- 17:00

Após ser fechado, o pop-up somente será exibido novamente no próximo período programado.

---

## 📄 Relatórios

O sistema permite gerar relatórios filtrando por:

- Funcionário
- EPI
- Período
- <img width="1360" height="686" alt="image" src="https://github.com/user-attachments/assets/4666eabd-832a-4a78-ac02-6ee2bdd14ea2" />


Também permite exportar para:

- PDF
- Excel (.xlsx)

---

## 👤 Controle de Permissões

### Administrador

- Controle total do sistema

### Gerente

- Cadastro de funcionários
- Cadastro de EPIs
- Registro de entregas
- Emissão de relatórios

### Funcionário

- Consulta dos próprios EPIs
- Consulta de estoque permitido

# 📱 Interface Responsiva

O sistema foi desenvolvido para utilização em:

- Desktop
- Tablets
- Smartphones

utilizando Tailwind CSS para adaptação automática da interface.



## Estrutura do Repositório

```bash
├── backend
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── prisma
│   │   ├── migrations
│   │   │   ├── 20260605200630_init
│   │   │   │   └── migration.sql
│   │   │   ├── 20260630185455_add_roles_and_employee_relation
│   │   │   │   └── migration.sql
│   │   │   ├── 20260701020131_add_employee_active
│   │   │   │   └── migration.sql
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── README.md
│   ├── scripts
│   │   └── check_epis.js
│   ├── server.js
│   ├── src
│   │   ├── controllers
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── deliveryController.js
│   │   │   ├── employeeController.js
│   │   │   ├── epiController.js
│   │   │   ├── reportController.js
│   │   │   └── userController.js
│   │   ├── index.js
│   │   ├── middlewares
│   │   │   ├── authMiddleware.js
│   │   │   ├── authorize.js
│   │   │   └── checkRole.js
│   │   ├── prisma
│   │   │   └── client.js
│   │   └── routes
│   │       ├── authRoutes.js
│   │       ├── dashboardRoutes.js
│   │       ├── deliveryRoutes.js
│   │       ├── employeeRoutes.js
│   │       ├── epiRoutes.js
│   │       ├── reportRoutes.js
│   │       └── userRoutes.js
│   └── teste.js
├── frontend
│   ├── assets
│   │   ├── css
│   │   │   ├── auth.css
│   │   │   ├── dashboard.css
│   │   │   ├── funcionarios.css
│   │   │   └── style.css
│   │   └── js
│   │       ├── api.js
│   │       ├── common.js
│   │       ├── dashboard.js
│   │       ├── entregas.js
│   │       ├── epis.js
│   │       ├── funcionarios.js
│   │       ├── index.js
│   │       ├── login.js
│   │       └── report.js
│   ├── dashboard.html
│   ├── entregas.html
│   ├── epis.html
│   ├── funcionarios.html
│   ├── index.html
│   ├── login.html
│   ├── relatorios.html
│   └── teste.js
├── package-lock.json
├── package.json
└── README.md

```

## Tecnologias

### Front-end

- HTML5
- JavaScript (ES6)
- Tailwind CSS
- Font Awesome

### Back-end

- Node.js
- Express

### Banco de Dados

- PostgreSQL
- Prisma ORM

### Segurança

- JWT
- Bcrypt

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

Versão 3.0

Versão 2.0
Integração das funcionalidades desenvolvidas pela equipe.
Dashboard atualizado com novos indicadores.
Melhorias na interface do sistema.
Ajustes na tela de Funcionários.
Correções realizadas após o processo de Merge.
Atualização da documentação do projeto.

---

# 👨‍💻 Autores

**Daniel da Cruz Santos Paraná**
**Débora Eduarda Schol**
**Fabrício Torri**
**Marcos Patrick Costa Campos**

Projeto desenvolvido para o curso de **Análise e Desenvolvimento de Sistemas**.

## Licença

MIT
