# 🚛 Sistema de Gestão de Frota

Sistema web Full Stack desenvolvido para gerenciamento de operações logísticas, permitindo o controle de viagens, 
veículos, motoristas, clientes, fornecedores, abastecimentos, manutenções e despesas financeiras.

---

## 📸 Visão Geral

O sistema foi desenvolvido para empresas de transporte que desejam centralizar toda a gestão da frota em uma única plataforma.

### Principais funcionalidades

- ✅ Controle de viagens
- ✅ Gestão de caminhões
- ✅ Gestão de motoristas
- ✅ Cadastro de clientes
- ✅ Cadastro de fornecedores
- ✅ Controle de abastecimentos
- ✅ Manutenção preventiva
- ✅ Controle de troca de óleo
- ✅ Controle de pneus
- ✅ Histórico completo das viagens
- ✅ Controle financeiro (Receitas, Despesas e Adiantamentos)
- ✅ Relatórios em PDF
- ✅ Dashboard com indicadores
- ✅ Visualização de rotas em mapa
- ✅ Sistema de autenticação

---

# 🛠 Tecnologias

## Frontend

- React
- TypeScript
- Chakra UI
- React Router DOM
- Axios
- Leaflet
- Recharts
- jsPDF

## Backend

- Node.js
- Express

## Banco de Dados

- MongoDB

## Autenticação

- Firebase Authentication

---

# 🏗 Arquitetura

```
React (Frontend)
        │
        ▼
 REST API (Express)
        │
        ▼
     MongoDb
        │
        ▼
 Firebase Authentication
```

---

# 📂 Estrutura do Projeto

```
src
├── components
├── firebase
├── pages
├── routes
├── services
├── App.tsx
└── main.tsx
```

---

# 📦 Módulos

## 🚚 Viagens

- Cadastro
- Edição
- Exclusão
- Início da viagem
- Finalização
- Histórico
- Controle de status

---

## 🚛 Caminhões

- Cadastro
- Edição
- Exclusão
- Informações do veículo
- Quilometragem
- Documentação

---

## 👨‍✈️ Motoristas

- Cadastro
- Edição
- Exclusão
- Controle de CNH
- Situação do motorista

---

## ⛽ Abastecimentos

- Registro de abastecimentos
- Valor total
- Litros abastecidos
- Odômetro
- Dashboard de consumo

---

## 🔧 Manutenção Preventiva

- Agendamento
- Histórico
- Custos
- Próxima revisão
- Dashboard

---

## 🛢 Troca de Óleo

- Registro das trocas
- Quilometragem
- Tipo de óleo
- Histórico

---

## 🛞 Pneus

- Controle de pneus
- Marca
- Posição
- Valor
- Histórico

---

## 👥 Clientes

- Cadastro
- Atualização
- Exclusão

---

## 🏢 Fornecedores

- Cadastro
- Atualização
- Exclusão

---

## 💰 Financeiro

Cada viagem possui:

- Receitas
- Despesas
- Adiantamentos

Além de:

- Saldo da viagem
- Relatório PDF

---

## 🗺 Mapa

Visualização da rota utilizando:

- OpenStreetMap
- Leaflet
- OSRM

---

# 🔐 Autenticação

O sistema utiliza Firebase Authentication para login.

Funcionalidades:

- Login
- Recuperação de senha
- Controle de sessão
- Validação de usuário ativo

---

# 📊 Dashboard

Indicadores disponíveis:

- Consumo de combustível
- Custos de manutenção
- Histórico de viagens
- Financeiro
- Troca de óleo
- Pneus

---

# 🌐 API

Base URL

```
https://backend-frotas.onrender.com/api
```

Principais endpoints

```
/viagens
/motoristas
/caminhoes
/clientes
/fornecedores
/abastecimentos
/manuPrev
/trocaOleo
/trocaPneus
```

---

# 📑 Funcionalidades

- CRUD completo de todos os módulos
- Sistema responsivo
- Dashboard analítico
- Relatórios PDF
- Controle financeiro por viagem
- Visualização de rotas
- Autenticação segura
- Persistência em Firebase

---

# 🚀 Como executar

## Instale as dependências

```bash
npm install
```

## Execute

```bash
npm start
```

# 👨‍💻 Desenvolvedor

**Erick Saraiva**

Desenvolvedor Full Stack

React • TypeScript • Node.js • Firebase • Express • MongoDb
