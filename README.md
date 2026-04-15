# 🗂️ Task Manager DevOps

Sistema de gerenciamento de tarefas desenvolvido como atividade prática da disciplina de Engenharia de Software / DevOps, com foco na aplicação de metodologias ágeis e integração contínua.

---

## 🚀 Acesso ao sistema

🔗 **Aplicação em produção (Render):**
[https://task-manager-devops-3xfq.onrender.com/](https://task-manager-devops-3xfq.onrender.com/)

---

## 🎯 Objetivo do Projeto

Desenvolver um sistema simples de gerenciamento de tarefas aplicando na prática:

* Scrum (planejamento e backlog)
* Kanban (controle visual)
* GitHub Issues (organização do trabalho)
* Git (versionamento)
* GitHub Actions (integração contínua)
* Deploy automatizado (DevOps)

---

## ⚙️ Funcionalidades

### 📝 Tarefas

* Criar tarefa
* Editar tarefa
* Excluir tarefa
* Listar tarefas
* Buscar tarefa por ID
* Atualizar status da tarefa (PENDENTE, EM_ANDAMENTO, CONCLUIDA, CANCELADA)
* Filtros por:

    * status
    * categoria
    * título
* Paginação e ordenação

### 📁 Categorias

* Criar categoria
* Editar categoria
* Excluir categoria
* Listar categorias

---

## 🧠 Regras de Negócio

* Toda tarefa deve possuir uma categoria válida
* Não é permitido cadastrar categorias com nomes duplicados
* Não é possível excluir uma categoria com tarefas associadas
* Datas não podem ser inconsistentes:

    * conclusão < criação ❌
    * previsão < criação ❌
* Ao concluir uma tarefa, a data de conclusão pode ser preenchida automaticamente

---

## 🏗️ Arquitetura do Sistema

O projeto segue uma arquitetura em camadas:

* **Controller** → Endpoints REST
* **DTO** → Padronização de entrada/saída
* **Service** → Regras de negócio
* **Repository** → Acesso ao banco
* **Model** → Entidades

---

## 🛠️ Tecnologias Utilizadas

### Backend

* Java 17
* Spring Boot
* Spring Web
* Spring Data JPA
* Spring Validation
* Thymeleaf

### Banco de Dados

* PostgreSQL
* Flyway (migrações)

### DevOps

* Git
* GitHub
* GitHub Actions
* Render (deploy)

### Build

* Maven

---

## 🗄️ Modelo de Dados

### Categoria

* id
* nome

### Tarefa

* id
* titulo
* descricao
* dataCriacao
* dataPrevistaConclusao
* dataConclusao
* status
* categoriaId

Relacionamento:

* 1 categoria → N tarefas

---

## 🚀 Deploy (DevOps)

O sistema foi implantado em produção utilizando o **Render**, com integração automática ao GitHub.

### 🔄 Pipeline de Deploy

1. Push para o repositório GitHub
2. Render detecta alteração
3. Build automático (Maven)
4. Deploy automático
5. Aplicação atualizada em produção

### 💡 Conceitos aplicados

* CI/CD simplificado
* Automação de build
* Deploy contínuo
* Uso de variáveis de ambiente

---

## 🤖 Integração Contínua (GitHub Actions)

O projeto possui pipeline configurado que:

* Executa build automaticamente
* Roda testes
* Utiliza container PostgreSQL durante execução
* Gera relatórios de testes

Execução em:

* push na branch `main`
* pull requests

---

## 📦 Release

Versão: **v1.0.0**

### Entregas:
- CRUD completo de tarefas e categorias
- Regras de negócio implementadas
- API REST funcional
- CI/CD com GitHub Actions
- Deploy automatizado no Render

🔗 https://github.com/cowpox/task-manager-devops/releases/tag/v1.0.0

---

## ▶️ Como Executar Localmente

### Pré-requisitos

* Java 17
* Maven
* PostgreSQL

### 1. Clonar o projeto

```bash
git clone https://github.com/cowpox/task-manager-devops.git
cd task-manager-devops/backend
```

### 2. Configurar variáveis de ambiente

Windows (PowerShell):

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/taskmanager"
$env:DB_USER="postgres"
$env:DB_PASSWORD="sua_senha"
```

Linux/Mac:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/taskmanager
export DB_USER=postgres
export DB_PASSWORD=sua_senha
```

### 3. Rodar a aplicação

```bash
./mvnw spring-boot:run
```

### 4. Acessar

```
http://localhost:8080
```

---

## 📡 Principais Endpoints

### Tarefas

* `GET /api/tarefas`
* `GET /api/tarefas/{id}`
* `POST /api/tarefas`
* `PUT /api/tarefas/{id}`
* `PATCH /api/tarefas/{id}/status`
* `DELETE /api/tarefas/{id}`

### Categorias

* `GET /api/categorias`
* `POST /api/categorias`
* `PUT /api/categorias/{id}`
* `DELETE /api/categorias/{id}`

---

## 🧪 Exemplos

### Criar categoria

```json
{
  "nome": "Estudos"
}
```

### Criar tarefa

```json
{
  "titulo": "Finalizar atividade DevOps",
  "descricao": "Completar README e deploy",
  "status": "PENDENTE",
  "categoriaId": 1,
  "dataPrevistaConclusao": "2026-04-20T23:59:00"
}
```

---

## 📊 Metodologias Ágeis

### Scrum

* Definição de backlog
* Sprint única
* Divisão de tarefas

### Kanban

* To Do
* In Progress
* Review
* Done

### GitHub Issues

* Organização por tarefas
* Atribuição de responsáveis
* Uso de labels (feat, bug, test, review)

---

## 🎓 Informações Acadêmicas

**Disciplina:** Engenharia de Software / DevOps
**Professor:** André Menolli

**Curso:** Ciência de Dados e Inteligência Artificial
**Ano:** 3º ano

**Instituição:** Universidade Estadual de Londrina (UEL)

---

## 👥 Integrantes

* Adriano Lúcio Uchoa Brandão
* Julia Yokoyama Massaki
* Rafael Figueiredo Cobo
* Sofia Gutschow Casal

---

## 🧾 Considerações Finais

Este projeto demonstra a aplicação prática de conceitos modernos de desenvolvimento de software, incluindo:

* organização ágil
* boas práticas de backend
* validação e tratamento de erros
* integração contínua
* deploy automatizado

O sistema evoluiu além de um CRUD simples, incorporando regras de negócio, filtros, paginação e uma pipeline de entrega contínua funcional.

---

## 📌 Status

✅ Projeto concluído
🚀 Deploy em produção ativo
⚙️ CI/CD configurado
