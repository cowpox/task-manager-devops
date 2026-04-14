# Task Manager DevOps

Projeto acadêmico de um **Sistema de Gerenciamento de Tarefas**, desenvolvido para aplicar na prática conceitos de **Engenharia de Software**, **Scrum**, **Kanban** e **DevOps com GitHub**.

O sistema permite o gerenciamento de tarefas e categorias, com backend em **Java + Spring Boot** e banco de dados **PostgreSQL**, além de automação de build e testes com **GitHub Actions**.

---

## Objetivo do projeto

Este projeto foi desenvolvido como parte de um exercício prático cujo objetivo era construir um sistema simples de gerenciamento de tarefas, aplicando:

- organização ágil com **Product Backlog**
- acompanhamento visual com **Kanban**
- controle de trabalho com **GitHub Issues**
- versionamento com **Git e GitHub**
- integração contínua com **GitHub Actions**
- documentação e entrega versionada do sistema

---

## Funcionalidades implementadas

### Tarefas
- Criar tarefa
- Editar tarefa
- Excluir tarefa
- Listar tarefas
- Buscar tarefa por ID
- Atualizar status da tarefa
- Filtrar tarefas por:
    - status
    - categoria
    - título
- Paginação e ordenação de resultados

### Categorias
- Criar categoria
- Editar categoria
- Excluir categoria
- Listar categorias
- Buscar categoria por ID

### Regras de negócio
- Toda tarefa deve estar vinculada a uma categoria
- O título da tarefa é obrigatório
- O nome da categoria é obrigatório
- Não é permitido cadastrar categorias duplicadas
- Não é permitido excluir categoria que possua tarefas vinculadas
- Ao concluir uma tarefa, a data de conclusão pode ser preenchida automaticamente
- Datas de conclusão e previsão não podem ser anteriores à data de criação

---

## Tecnologias utilizadas

### Backend
- Java 17
- Spring Boot 3
- Spring Web
- Spring Validation
- Spring Data JPA
- Thymeleaf
- Maven

### Banco de dados
- PostgreSQL
- Flyway

### DevOps e colaboração
- Git
- GitHub
- GitHub Issues
- GitHub Projects (Kanban)
- GitHub Actions

### Containerização
- Docker

---

## Estrutura do repositório

```text
task-manager-devops/
├── .github/
│   └── workflows/
│       └── build.yml
├── backend/
│   ├── .mvn/
│   ├── src/
│   ├── Dockerfile
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── database/
│   └── devopsTaskManagerV1
├── design/
├── docs/
│   ├── DER_Task_Manager_V1.pdf
│   ├── task-manager-devops-MER_V2.png
│   └── task-manager-devops-V2.drawio.png
└── README.md