---
título: Design Tokens e Tipografia — Frontend FarmaControl
versão do documento: 1.0
data: 2026-09-02
status: normativo — implementa a regra de "fonte única de tokens" de
        `agents.md` §5.1.3 (tailwind.config.ts é a fonte; o ConfigProvider
        do antd lê os mesmos valores)
---

# 02 — Design Tokens e Tipografia

## 2.1 Fonte única de verdade

`agents.md` §5.1.3: a paleta, a escala de espaçamento e o raio de borda vivem
**uma vez** em `tailwind.config.ts` (`theme.extend`); o tema do
`ConfigProvider` do Ant Design lê os mesmos valores. Este documento é a
especificação desses valores; a implementação em código fica em:

```
frontend/
├─ tailwind.config.ts              ← fonte: cores (de `01`), espaço, tipo, raio, sombra, breakpoints
└─ src/compartilhado/tema/
   ├─ tokens.ts                    ← reexporta os tokens do tailwind.config para uso em TS
   └─ temaAntd.ts                  ← monta o objeto `theme`/`token` do ConfigProvider a partir de tokens.ts
```

Nenhum componente de tela lê hex, `px` de espaçamento ou raio literais —
sempre via classe Tailwind (`gap-4`, `rounded-md`, `text-slate-700`) ou via
token do antd (`token.colorPrimary`).

## 2.2 Escala de espaçamento (base 4px)

Mantém a escala padrão do Tailwind (`0.5 = 2px`, `1 = 4px`, `2 = 8px`,
`3 = 12px`, `4 = 16px`, `6 = 24px`, `8 = 32px`, `12 = 48px`…). Convenções de
uso no projeto:

| Contexto | Espaço |
|---|---|
| padding interno de célula de tabela (modo compacto) | `8px` vertical / `12px` horizontal |
| padding interno de célula de tabela (modo confortável) | `12px` / `16px` |
| gap entre campos de formulário empilhados | `16px` (mobile) → `20px` (`lg:`) |
| gap entre grupos/seções de formulário | `24px` (mobile) → `32px` (`lg:`) |
| padding do card de conteúdo | `16px` (mobile) → `24px` (`lg:`) |
| gutter de grid de formulário multi-coluna (`lg:`) | `24px` |
| altura mínima de alvo de toque (mobile) | **44px** (`min-h-11`) |
| altura da barra de ação fixa mobile | `56px` + `env(safe-area-inset-bottom)` |
| altura da topbar | `56px` (mobile) → `64px` (`lg:`) |
| largura da sidebar expandida (`lg:`) | `240px` · colapsada `64px` |

## 2.3 Tipografia

### 2.3.1 Pilha de fontes

**Sem Google Fonts / sem `@font-face` externo** — aplicação interna, ganho de
performance, zero atrito de CSP, e alinhado a "manter dependências enxutas"
(`.spec/12` D-05).

```
--fonte-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              "Helvetica Neue", Arial, "Noto Sans", sans-serif;
--fonte-mono: "SFMono-Regular", "Cascadia Code", Consolas,
              "Liberation Mono", Menlo, monospace;
```

`Inter` self-hospedado (woff2, `font-display: swap`, subset latino) é uma
opção **pós-MVP** se a marca pedir uma fonte própria — trocar só a variável
`--fonte-sans`.

### 2.3.2 Escala tipográfica

Mobile-first: os tamanhos abaixo são o **base (mobile)**; onde indicado, sobem
em `lg:`.

| Papel | Tamanho / linha | Peso | Cor | Observação |
|---|---|---|---|---|
| `display` (título de tela grande, raro) | 24 / 32 → `lg:` 30 / 38 | 600 | `neutral/800` | Painel, telas de destaque |
| `h1` / título de página | 20 / 28 → `lg:` 24 / 32 | 600 | `neutral/800` | um por tela, no `PageHeader` |
| `h2` / título de seção-aba | 16 / 24 → `lg:` 18 / 26 | 600 | `neutral/800` | cabeçalho de `SectionCard` |
| `h3` / subtítulo | 14 / 20 | 600 | `neutral/700` | agrupador dentro de aba |
| `body` | 14 / 20 | 400 | `neutral/700` | texto padrão, valores de campo |
| `body-strong` | 14 / 20 | 600 | `neutral/800` | valor em destaque (ex.: "Saldo após" no Kardex) |
| `label` | 13 / 18 | 500 | `neutral/600` | rótulo de campo, cabeçalho de coluna |
| `caption` | 12 / 16 | 400 | `neutral/500` | texto de ajuda, metadado, auditoria |
| `mono` | 13 / 18 | 400 | herda | códigos: barras, lote, NCM, CNPJ, id |

Regras:
- `mono` sempre com `font-variant-numeric: tabular-nums` — colunas de código e
  de valor alinham verticalmente.
- Valores monetários e quantidades em tabela: `tabular-nums`, alinhados à
  direita (`.spec/03` §3.8).
- Nunca abaixo de 12px em texto legível; 11px só em `<Tag>` compacta com peso
  ≥ 500.
- Truncar com reticências + `title`/tooltip em célula de tabela; **nunca**
  truncar mensagem de erro de validação.

## 2.4 Raio de borda

| Token | Valor | Uso |
|---|---|---|
| `rounded-sm` | `4px` | `<Tag>`, chip, badge |
| `rounded-md` | `6px` | input, select, botão, célula editável |
| `rounded-lg` | `10px` | card, modal, drawer, popover, `KpiCard` |
| `rounded-full` | `9999px` | avatar, indicador de status pontual, botão-ícone circular |

`borderRadius` do antd = `6px` (casa com `rounded-md`).

## 2.5 Elevação (sombra)

Três níveis apenas — ERP interno não precisa de profundidade decorativa.

| Token | Valor | Uso |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(15,23,42,.06)` | card em repouso, linha de tabela em hover |
| `shadow-md` | `0 4px 12px rgba(15,23,42,.10)` | dropdown, popover, `SelectAutocomplete` aberto, barra de ação fixa mobile (sombra para cima) |
| `shadow-lg` | `0 12px 32px rgba(15,23,42,.16)` | modal, drawer |

Sidebar fixa e topbar usam **borda** (`neutral/200`), não sombra.

## 2.6 Movimento

| Token | Duração | Curva | Uso |
|---|---|---|---|
| `motion-fast` | 120ms | `ease-out` | hover, foco, toggle de switch |
| `motion-base` | 200ms | `cubic-bezier(.2,0,0,1)` | abrir/fechar dropdown, expandir accordion |
| `motion-slow` | 280ms | `cubic-bezier(.2,0,0,1)` | entrada de drawer/modal, transição de rota |

`@media (prefers-reduced-motion: reduce)` → todas as durações caem para `0ms`
exceto opacidade (mantém `120ms` para não "piscar"). Nenhuma animação de
`transform` contínua/parallax em lugar nenhum.

## 2.7 Tokens semânticos (a ponte para modo escuro futuro)

O `tokens.ts` expõe os valores de `01` sob **nomes de papel**, não de cor
crua. Telas e o `temaAntd.ts` consomem os papéis:

| Papel | Valor claro (MVP) |
|---|---|
| `corPrimaria` | `#1663B3` |
| `corPrimariaHover` | `#124F8F` |
| `corAcento` | `#0E9384` |
| `corFundoApp` | `#F6F8FA` |
| `corSuperficie` | `#FFFFFF` |
| `corSuperficieAfundada` | `#F1F5F9` |
| `corBorda` | `#E2E8F0` |
| `corTextoForte` | `#1E293B` |
| `corTextoCorpo` | `#334155` |
| `corTextoSecundario` | `#64748B` |
| `corTextoDesabilitado` | `#94A3B8` |
| `corSucesso` / `corSucessoFundo` | `#2E7D32` / `#E9F5EA` |
| `corAlerta` / `corAlertaFundo` | `#D97706` / `#FEF3E2` |
| `corErro` / `corErroFundo` | `#C62828` / `#FCEBEA` |
| `corInfo` / `corInfoFundo` | `#1663B3` / `#EEF4FB` |

Um tema escuro futuro redefine **só este mapa** (e o bloco
`@media (prefers-color-scheme: dark)` das variáveis CSS globais em
`compartilhado/estilos/index.css`), sem tocar em componente de tela.

## 2.8 Setup de convivência Tailwind × antd (recapitulando `agents.md` §5.1)

Checklist que a Etapa 0 precisa cumprir:

1. `corePlugins: { preflight: false }` no `tailwind.config.ts` — reset fica com
   o antd v6.
2. Ordem de import em `index.css`: reset/tokens do antd **antes** de
   `@tailwind base; @tailwind components; @tailwind utilities;`.
3. `prefix: ''` (sem prefixo) — sem colisão esperada porque o Preflight está
   desligado e o antd usa classes `ant-*`.
4. `theme.extend` do Tailwind e o objeto `token` do `ConfigProvider` **ambos
   derivam de `tokens.ts`** — nunca duas paletas mantidas à mão.
5. `content` do Tailwind cobrindo `./index.html` e `./src/**/*.{ts,tsx}`.
6. `postcss.config.js` com `tailwindcss` + `autoprefixer`.
