#  Sistema EPI — Backend API

Backend desenvolvido em Node.js + Express + Prisma + PostgreSQL para gerenciamento de:

* Usuários
* Funcionários
* EPIs
* Entrega de EPIs
* Controle de estoque
* Autenticação JWT

---

#  Tecnologias Utilizadas

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* Supabase
* JWT
* bcryptjs
* Cors
* Nodemon

---

#  Estrutura do Projeto

```bash
backend/
 ├── prisma/
 │   ├── migrations/
 │   └── schema.prisma
 │
 ├── src/
 │   ├── controllers/
 │   ├── middlewares/
 │   ├── prisma/
 │   ├── routes/
 │   └── index.js
 │
 ├── .env
 ├── package.json
 └── README.md
```

---

#  Como Rodar o Projeto

# 1- Clonar o repositório

```bash
git clone https://github.com/fabriciotorri/sistema-epi.git
```

---

# 2- Entrar na pasta backend

```bash
cd sistema-epi/backend
```

---

# 3- Instalar dependências

```bash
npm install
```

---

# 4- Criar arquivo .env

Criar um arquivo:

```bash
.env
```

Adicionar:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/postgres"
JWT_SECRET="seuSegredoJWT"
```

---

#  Como Criar Banco no Supabase

# 1- Criar conta

Acessar:

[https://supabase.com](https://supabase.com)

---

# 2- Criar novo projeto

Escolher:

* Nome
* Senha do banco
* Região

---

# 3- Pegar DATABASE_URL

No painel:

```text
Project Settings → Database → Connection String
```

Escolher:

```text
URI
```

Copiar a conexão.

---

# 4- Colocar no .env

Exemplo:

```env
DATABASE_URL="postgresql://postgres:senha@db.xxxxxxxxx.supabase.co:5432/postgres"
```

---

#  Criar Tabelas do Banco

Rodar:

```bash
npx prisma migrate dev
```

---

#  Gerar Prisma Client

```bash
npx prisma generate
```

---

#  Rodar o Servidor

```bash
npm run dev
```

Servidor:

```text
http://localhost:3000
```

---

#  Autenticação JWT

Algumas rotas precisam de token.

Fluxo:

1. Fazer login
2. Receber token
3. Enviar token nas próximas requisições

---

#  LOGIN

## POST

```http
POST /login
```

BODY:

```json
{
  "email": "fabricio@email.com",
  "password": "123456"
}
```

---

#  RETORNO

```json
{
  "token": "TOKEN_JWT"
}
```

---

#  Rotas Protegidas

Enviar no Header:

```text
Authorization: Bearer TOKEN_JWT
```

---

#  ROTAS DA API

#  USERS

## Criar usuário

```http
POST /users
```

BODY:

```json
{
  "name": "Fabricio",
  "email": "fabricio@email.com",
  "password": "123456"
}
```

---

#  EMPLOYEES

## Listar funcionários

```http
GET /employees
```

---

## Criar funcionário

```http
POST /employees
```

BODY:

```json
{
  "nome": "Carlos Pereira",
  "cpf": "12345678900",
  "cargo": "Soldador"
}
```

---

#  EPIS

## Listar EPIs

```http
GET /epis
```

---

## Criar EPI

```http
POST /epis
```

BODY:

```json
{
  "nome": "Capacete Branco",
  "lote": "LT2026",
  "quantidade": 50,
  "validade": "2027-12-31"
}
```

---

#  DELIVERIES

## Listar entregas

```http
GET /deliveries
```

---

## Realizar entrega

```http
POST /deliveries
```

BODY:

```json
{
  "employeeId": 1,
  "epiId": 1,
  "quantidade": 2
}
```

---

#  Como Conectar o Frontend

O frontend deve consumir a API utilizando a URL do backend.

---

#  Ambiente local

```js
http://localhost:3000
```

---

#  Backend em produção

Exemplo:

```js
https://api-sistema-epi.onrender.com
```

---

#  Exemplo no Frontend React

```js
const API = 'http://localhost:3000'

fetch(`${API}/employees`)
```

---

#  Exemplo com Token

```js
fetch(`${API}/employees`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

---

#  Se Outro Integrante Criar Novo Banco

Sim 

É muito fácil trocar o banco.

Basta:

1. Criar novo projeto no Supabase
2. Copiar nova DATABASE_URL
3. Alterar no arquivo .env
4. Rodar:

```bash
npx prisma migrate dev
```

O Prisma recria toda a estrutura automaticamente.

---

#  Deploy Recomendado

## Backend

* Render
* Railway

---

## Frontend

* Vercel

---


Projeto acadêmico — Sistema de Controle de EPI
