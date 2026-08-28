# Design System & Padrões Visuais (Backoffice SaúdeFem)

Este documento define a paleta de cores, tipografia, tokens e regras de estilo do Backoffice administrativo renderizado no Flask/Jinja2.

---

## 🎨 Paleta de Cores & Tokens (Rosa / Malva com Base Neutra Quente)

### 1. Tokens Gerais do Sistema

| Token | HSL | HEX aprox. | Uso / Descrição |
|---|---|---|---|
| `--background` | `30 20% 97%` | `#FAF8F5` | Fundo geral da página (creme claro) |
| `--foreground` | `220 20% 14%` | `#1D222A` | Texto principal |
| `--primary` | `340 55% 42%` | `#A63058` | Rosa/malva escuro — botões principais, seleções ativas, destaques |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre elementos primários |
| `--secondary` | `30 15% 93%` | `#F1EFEB` | Superfícies secundárias, cards sutis |
| `--secondary-foreground` | `220 20% 25%` | `#333C4A` | Texto sobre secundário |
| `--accent` | `340 30% 92%` | `#F5E5EC` | Fundo de badges, tags e filtros ativos |
| `--accent-foreground` | `340 55% 32%` | `#7E2543` | Texto sobre fundos accent |
| `--muted` | `30 12% 91%` | `#ECEAE5` | Elementos desabilitados ou planos neutros |
| `--muted-foreground` | `220 10% 50%` | `#737B8B` | Texto secundário, placeholders e legendas |
| `--destructive` | `0 72% 51%` | `#E12D2D` | Ações destrutivas (excluir) |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Texto sobre ações destrutivas |
| `--border` | `220 13% 88%` | `#DCDFE5` | Bordas gerais, divisores e cards |
| `--input` | `220 13% 88%` | `#DCDFE5` | Bordas padrão de campos de formulário, inputs e selects (cinza neutro) |
| `--ring` | `340 55% 42%` | `#A63058` | Anel e borda de foco (focus-visible) na cor primária |

---

### 2. Sidebar (Menu Lateral)

| Token | HSL | HEX aprox. | Uso / Descrição |
|---|---|---|---|
| `--sidebar-background` | `220 22% 13%` | `#1A1E28` | Fundo escuro azul-acinzentado |
| `--sidebar-primary` | `340 55% 60%` | `#CE6387` | Destaque rosa/malva para item ativo no menu |
| `--sidebar-primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto e ícone sobre o item de menu ativo |
| `--sidebar-accent` | `220 18% 20%` | `#292E3D` | Fundo de hover nos itens do menu |
| `--sidebar-accent-foreground` | `220 10% 90%` | `#E2E5EB` | Destaque de texto/logo no cabeçalho e footer da sidebar |
| `--sidebar-foreground` | `220 10% 75%` | `#B6BAC3` | Texto e ícones padrão da sidebar |

---

### 3. Status Semântico (Badges & Indicadores)

| Token | HSL | HEX aprox. | Uso / Descrição |
|---|---|---|---|
| `--status-active` | `152 55% 38%` | `#2BA366` | Verde para texto de status **• ATIVO** |
| `--status-active-bg` | `152 55% 94%` | `#E8F8F0` | Fundo para badge de status **• ATIVO** |
| `--status-inactive` | `220 10% 55%` | `#7E8797` | Cinza para texto de status **• INATIVO** |
| `--status-inactive-bg` | `220 10% 92%` | `#EAECEF` | Fundo para badge de status **• INATIVO** |

---

### 4. Gráficos & Métricas (Dashboards)

| Token | HSL | HEX aprox. |
|---|---|---|
| `--chart-1` | `340 55% 50%` | `#C63E6E` (Rosa/Malva) |
| `--chart-2` | `200 70% 48%` | `#2590CF` (Azul) |
| `--chart-3` | `45 85% 55%` | `#EAAE2E` (Dourado/Amarelo) |
| `--chart-4` | `152 55% 42%` | `#30A66D` (Verde) |
| `--chart-5` | `280 40% 55%` | `#935EB8` (Roxo) |

---

## ✍️ Tipografia Global

- **Família única:** `'Inter', 'Segoe UI', system-ui, sans-serif` (definida no `body`)
- **Escala de pesos:** 400 (normal) / 500 (medium) / 600 (semibold) / 700 (bold)
- **Headings (h1–h6):** Inter, `letter-spacing: -0.02em`, `text-wrap: balance`
- **Parágrafos:** Inter, `text-wrap: pretty`

---

## 📐 Padrões por Componente

### 1. Sidebar
- **Logo "SaúdeFem":** Inter, `font-semibold` (600), `text-sm` — cor `--sidebar-accent-foreground` (`220 10% 90%`)
- **Subtítulo "Administração":** Inter, `text-xs`, peso normal (400) — cor `--sidebar-foreground` (`220 10% 75%`)
- **Label "Menu Principal":** Inter, `font-semibold` (600), `text-[10px]`, uppercase, tracking largo — `--sidebar-foreground` com `opacity-60`
- **Itens de navegação:** Inter, `text-sm`, peso normal (400); item ativo `font-medium` (500)
  - Cor padrão: `--sidebar-foreground` (`220 10% 75%`)
  - Cor ativa: `--sidebar-primary-foreground` `0 0% 100%` (branco) sobre `--sidebar-primary` `340 55% 60%` (rosa)
- **Footer (nome do admin):** `font-medium` (500), `text-xs` — `--sidebar-accent-foreground`
- **Fundo da sidebar:** `--sidebar-background` `220 22% 13%` (azul-escuro)

### 2. Títulos de Página (h1, ex: "Usuárias")
- Inter, `text-2xl`, `font-bold` (700) — cor `--foreground` (`220 20% 14%`)
- Subtítulo/contador: Inter, peso normal (400) — `--muted-foreground` (`220 10% 50%`)

### 3. Tabelas / Grid
- **Cabeçalho (`th`):** Inter, `font-semibold` (600), `text-xs`, uppercase, `tracking-wide` — cor `--muted-foreground` (`220 10% 50%`) sobre fundo `--muted/50`
- **Títulos e Nomes (coluna principal):** Inter, `font-semibold` (600) — cor `--foreground` (`220 20% 14%`)
- **Células de texto geral (tema, data, email, etc.):** Inter, `text-sm`, peso normal (400) — cor `--foreground` (`220 20% 14%`)
- **Ícones de Ação:**
  - **Visualizar (`eye`):** cor preta/escura (`text-foreground hover:text-primary`) — exclusivo de Artigos
  - **Editar (`edit-2`):** cor preta/escura (`text-foreground hover:text-primary`) — Temas, Sintomas, Palavras-chave, Fases e Artigos
  - **Inativar / Ativar (`power`):**
    - Item **ATIVO** (ação de inativar): **Vermelho** (`text-red-500 hover:text-red-600 hover:bg-red-50`)
    - Item **INATIVO** (ação de ativar): **Verde** (`text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50`)
    - **Proteção de Auto-Bloqueio:** O usuário logado possui a tag `(Você)` e o botão de inativar fica desabilitado em sua própria linha (além de bloqueado no backend).
- **Estado vazio / paginação:** peso normal (400) — `--muted-foreground`

### 4. Inputs (`Input`, busca, textarea)
- Inter, `text-sm`, peso normal (400) — texto em `--foreground`
- Placeholder: `--muted-foreground` (`220 10% 50%`)
- Borda padrão: `--input` (`220 13% 88%` — cinza neutro semelhante aos grids e cards)
- Borda e anel de foco: `--ring` (`340 55% 42%` — cor primária rosa/malva)
- Altura: `40px` (`h-10`)

### 5. Botões (`Button` shadcn style)
- Inter, `text-sm`, `font-medium` (500) em todas as variantes
- Altura: `40px` (`h-10`)
- **Default (`.btn-primary`):** texto `--primary-foreground` (branco) sobre `--primary` `340 55% 42%` (rosa/malva)
- **Outline (`.btn-outline`):** texto `--foreground` sobre fundo transparente, borda `--border`
- **Ghost (`.btn-ghost`):** texto `--foreground`; hover com fundo `--accent` `340 30% 92%` e texto `--accent-foreground` `340 55% 32%`
- **Destructive (`.btn-destructive`):** branco sobre `--destructive` `0 72% 51%`
- **Secondary (`.btn-secondary`):** `--secondary-foreground` sobre `--secondary`

### 6. Badges de Situação
- Inter, `text-xs`, `font-medium` (500)
- **ATIVO:** texto `--status-active` `152 55% 38%` (verde) sobre fundo `--status-active-bg` `152 55% 94%`
- **INATIVO:** texto `--status-inactive` `220 10% 55%` (cinza) sobre fundo `--status-inactive-bg` `220 10% 92%`

### 7. Badges/Pills de Tags (ex: Fase da Vida, Palavras-chave, Perfil)
- Inter, `text-xs`, peso normal (400) — texto `--accent-foreground` `340 55% 32%` sobre fundo `--accent` `340 30% 92%`

### 8. Selects
- Inter, `text-sm`, peso normal (400) — `--foreground`; placeholder em `--muted-foreground`; borda `--input` (`220 13% 88%`), foco ring `--ring` (`340 55% 42%`); altura `40px` (`h-10`)


