# ⚡ Hardware Hub - Marketplace

> Um marketplace completo e conteinerizado, desenvolvido para facilitar a compra e venda de peças de hardware e tecnologia.

## 💡 Sobre o Projeto

O Hardware Hub nasceu da união entre o fascínio por eletrônicos, montagem de setups e o desenvolvimento de software. Como alguém que está sempre de olho em componentes, seja garimpando peças na OLX ou lidando com projetos de hardware, decidi criar do zero uma plataforma que simulasse a experiência real de um marketplace focado nesse nicho.

O objetivo aqui foi construir uma aplicação Full-Stack robusta, indo muito além de um layout estático. O sistema conta com banco de dados real, sistema de autenticação, persistência de sessão e uma infraestrutura totalmente isolada via Docker.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

**Front-end:**
* **React.js** (criado com Vite para maior performance de build)
* **CSS3** (Estilização responsiva e customizada, sem frameworks)
* Gerenciamento de estado com `useState` e `useEffect`
* Sessão de usuários via `localStorage`

**Back-end & Infraestrutura:**
* **Node.js** (API RESTful para gerenciar usuários e produtos)
* **PostgreSQL** (Banco de dados relacional para garantir a integridade dos dados)
* **Docker & Docker Compose** (Orquestração de contêineres para Front, Back e Banco de Dados)

## ✨ Funcionalidades Principais

* **Catálogo Dinâmico:** Os produtos são carregados diretamente do banco de dados e renderizados na tela principal.
* **Sistema de Usuários:** Cadastro e Login totalmente funcionais. A interface se adapta para mostrar opções exclusivas para quem está logado.
* **Persistência de Sessão:** O navegador "lembra" do usuário logado mesmo após atualizações de página, graças à integração com o Local Storage.
* **Publicação de Anúncios:** Usuários autenticados podem cadastrar novos hardwares, que são imediatamente salvos no PostgreSQL e exibidos para todos na plataforma.
* **Filtro Inteligente:** Busca em tempo real por nome do produto ou categoria (GPU, CPU, Placa-Mãe, etc.).

## 🚀 Como rodar na sua máquina

A melhor parte desse projeto é que ele está 100% conteinerizado. Você não precisa instalar Node, Postgres ou configurar dependências manualmente. Apenas o **Docker** é necessário.

**1. Clone este repositório:**
```bash
git clone [https://github.com/SEU-USUARIO/marketplace-hardware.git](https://github.com/SEU-USUARIO/marketplace-hardware.git)
cd marketplace-hardware
