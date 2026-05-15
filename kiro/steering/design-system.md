# Design System

## Tipografia

| Função | Fonte | Pesos |
|--------|-------|-------|
| Títulos (Display) | Outfit | 400, 500, 600, 700 |
| Corpo de texto (Body) | Inter | 400, 500, 600 |

## Paleta de Cores (HSL)

| Token | Cor | Valor HSL |
|-------|-----|-----------|
| Primária | Lilás suave | `259 100% 74%` |
| Secundária | Rosa suave | `347 100% 76%` |
| Destaque (Accent) | Lilás muito claro | `259 100% 96%` |
| Texto do Accent | Lilás mais escuro | `259 100% 54%` |
| Destrutivo | Rosa/vermelho | `347 100% 76%` |
| Sucesso | Verde | `160 100% 36%` |
| Fundo | Branco quase puro | `0 0% 99.2%` |
| Texto principal | Cinza escuro | `184 14% 20.8%` |
| Muted | Cinza claro | `214 32% 93%` |
| Borda | Cinza muito claro | `214 32% 91%` |

## Diretrizes de Uso

- Sempre use as fontes **Outfit** para títulos e **Inter** para corpo de texto. Não introduza outras fontes sem aprovação.
- Aplique as cores via tokens (ex: `primary`, `secondary`, `accent`) em vez de valores hardcoded, para facilitar manutenção.
- O token `destructive` e `secondary` compartilham o mesmo valor HSL (`347 100% 76%`) — use `destructive` para ações de risco (deletar, cancelar) e `secondary` para elementos de destaque secundário.
- Mantenha contraste adequado: o texto principal (`184 14% 20.8%`) sobre o fundo (`0 0% 99.2%`) é a combinação padrão.
- Use `muted` e `border` apenas para elementos de suporte visual (separadores, fundos de cards, placeholders).
