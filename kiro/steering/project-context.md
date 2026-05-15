# Contexto do Projeto — Minha Saúde Feminina

## Visão Geral

**Minha Saúde Feminina** é um aplicativo mobile voltado ao autocuidado e à educação em saúde para mulheres. O projeto é uma iniciativa de Curricularização da Extensão desenvolvida por estudantes da **UNIFEBE**, com foco na disseminação de informações confiáveis baseadas nas diretrizes do sistema público de saúde brasileiro (SUS).

## Funcionalidades Principais

- **Monitoramento do ciclo menstrual** — registro e acompanhamento das datas do ciclo, previsão de próximos períodos e janela fértil.
- **Registro diário de sintomas** — diário de saúde onde a usuária registra sintomas físicos e emocionais ao longo do ciclo.
- **Biblioteca educativa** — artigos validados sobre saúde reprodutiva, organizados por temas como Menstruação, Gravidez e Contraceptivos.

## Estrutura do Monorepo

```
SistemaSaudeFeminina/
├── frontend/   # Aplicação Mobile (React Native + Expo)
├── backend/    # API REST (Python + Flask, padrão MVC)
└── sql/        # Scripts de modelagem e criação do banco de dados (PostgreSQL)
```

---

## Stack Tecnológica

### Frontend (`/frontend`)

- **Framework:** React Native com Expo (Managed Workflow)
- **Linguagem:** TypeScript (tipagem estrita)
- **Roteamento:** Expo Router (file-based routing)
- **Navegação:** React Navigation (bottom tabs)
- **Animações:** React Native Reanimated + Gesture Handler
- **HTTP Client:** Axios (para comunicação com a API)
- **Fontes:** expo-font (Outfit para títulos, Inter para corpo de texto)

> Ao criar telas e componentes, siga o padrão de roteamento do Expo Router: arquivos dentro de `app/` definem as rotas. Use TypeScript estrito — sem `any` implícito.

### Backend (`/backend`)

- **Framework:** Python + Flask
- **Arquitetura:** Padrão MVC (Models em `app/models/`, Controllers em `app/controllers/`, Routes em `app/routes/`)
- **ORM:** SQLAlchemy
- **Configuração:** python-dotenv (variáveis de ambiente via `.env`)
- **Ponto de entrada:** `run.py`
- **Configurações:** `config.py`

> Ao criar endpoints, registre a rota em `app/routes/`, implemente a lógica no controller correspondente em `app/controllers/`, e defina o modelo em `app/models/`. Mantenha a separação de responsabilidades do padrão MVC.

### Banco de Dados (`/sql`)

- **SGBD:** PostgreSQL
- **Scripts:** DDL e seeds ficam em `/sql/`

---

## Convenções e Boas Práticas

### Geral
- O público-alvo são mulheres brasileiras — toda interface e conteúdo deve estar em **português do Brasil**.
- Conteúdo de saúde deve ser baseado em fontes confiáveis (Ministério da Saúde, OMS, CFM).

### Frontend
- Componentes reutilizáveis ficam em `components/`.
- Siga o design system definido em `.kiro/steering/design-system.md` (cores, tipografia e tokens).
- Prefira componentes funcionais com hooks. Evite componentes de classe.
- Nomeie arquivos de componentes em PascalCase (ex: `CycleCard.tsx`).

### Backend
- Endpoints da API seguem o padrão REST.
- Retorne sempre JSON com estrutura consistente: `{ "data": ..., "message": ... }` para sucesso e `{ "error": ... }` para erros.
- Use variáveis de ambiente para credenciais e configurações sensíveis — nunca hardcode.
- Valide os dados de entrada nos controllers antes de persistir.

### Banco de Dados
- Nomeie tabelas no plural e em snake_case (ex: `menstrual_cycles`, `symptoms`, `articles`).
- Toda tabela deve ter uma coluna `id` (PK), `created_at` e `updated_at`.
