# 🛒 Projeto POS (Point of Sale)

## 🎯 Objetivo do Projeto
Este projeto tem como objetivo desenvolver uma aplicação backend robusta para um sistema de Ponto de Venda (POS), utilizando arquitetura moderna com foco em performance, persistência de dados e segurança. O foco inicial é estabelecer a infraestrutura e os endpoints CRUD (Create, Read, Update, Delete) para o cadastro de usuários.

## ⚙️ Stack Tecnológica

| Componente | Tecnologia | Versão |
| :--- | :--- | :--- |
| **Linguagem** | Java | 21 |
| **Framework** | Spring Boot | 3.x |
| **Persistência** | Spring Data JPA / Hibernate | - |
| **Banco de Dados** | PostgreSQL | 16 |
| **Containerização** | Docker & Docker Compose | - |
| **Build Tool** | Maven | - |

## 🚀 Como Rodar o Projeto (Passos de Execução)

Siga os passos abaixo para subir a infraestrutura e iniciar a aplicação.

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
1. Java Development Kit (JDK) 21 ou superior
2. Docker e Docker Compose
3. Maven

### Passo 1: Subir o Banco de Dados (PostgreSQL via Docker)
Navegue até a raiz do projeto e use o Docker Compose para subir o container do PostgreSQL, incluindo o volume de dados:
