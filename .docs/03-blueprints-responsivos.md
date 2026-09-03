---
título: Blueprints de Layout Responsivo (mobile-first) — Frontend FarmaControl
versão do documento: 1.0
data: 2026-09-02
status: normativo — detalha a tabela de "Padrões de adaptação obrigatórios"
        de `agents.md` §4.2. Onde uma fase (`.spec/04`–`09`) não disser nada
        em contrário, vale o comportamento aqui.
---

# 03 — Blueprints de Layout Responsivo

## 3.0 Regras gerais

- **Breakpoints** = padrão Tailwind (`agents.md` §4.1): base `0` (mobile),
  `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`.
- Verificação obrigatória de toda tela em **375 / 768 / 1280 px** antes de
  "pronta" (`agents.md` §7 item 13).
- O estilo **sem prefixo é o mobile**. `md:`/`lg:`/`xl:` só adicionam. Nunca
  `max-width` sobrescrevendo para baixo.
- Container de conteúdo: `max-width: 1440px`, centralizado, com padding
  lateral `16px` (mobile) → `24px` (`lg:`) → `32px` (`xl:`).

Legenda dos mockups: `▓` = elemento fixo/persistente · `░` = área de scroll ·
`[ ]` = controle · `≡` = ícone hambúrguer.

---

## 3.1 AppShell — navegação principal

### Mobile (base) — bottom nav + drawer "Mais"

```
▓───────────────────────────▓   topbar 56px: [≡]  FarmaControl        [👤]
│                             │   (empresa atual em caption sob o nome, se couber)
│ ░ conteúdo da rota ░        │
│                             │
▓───────────────────────────▓   bottom nav 56px + safe-area:
  [Painel][Cadastros][Estoque][Sistema][Mais]
```

- Máximo **5 itens** no bottom nav. O 5º ("Mais") abre um drawer de baixo
  para cima com o restante + Diagnóstico + Minha Conta + Sair.
- Itens do bottom nav = os módulos de topo que a permissão libera (`.spec/06`
  §6.9). Se o usuário só tem acesso a 1–2 módulos, o bottom nav mostra
  sub-itens diretos em vez de categorias.
- Item ativo: ícone + label em `primary/600`, indicador de `2px` no topo do
  item.
- `[≡]` na topbar abre o **drawer de navegação completo** (árvore de módulos)
  — redundante com o bottom nav, serve para navegação profunda e é o único
  meio no `md:`.

### `md:` (tablet) — drawer

```
▓ topbar 64px: [≡] FarmaControl                    Empresa X   [👤]
│ ░ conteúdo ░
```

- Sem bottom nav. `[≡]` abre drawer de navegação (overlay) com a árvore
  completa; fecha ao escolher item ou tocar fora.

### `lg:` (desktop) — sidebar fixa

```
▓────────▓▓ topbar 64px: FarmaControl        Empresa X · Filial Y   [👤 ▾]
│ sidebar ││ ░ breadcrumb ░
│ 240px   ││ ░ PageHeader (h1 + ações) ░
│ (fixa,  ││ ░ conteúdo ░
│ colap-  ││
│ sável)  ││
▓────────▓▓
```

- Sidebar fixa, colapsável para `64px` (só ícones + tooltip). Estado
  colapsado persistido por usuário (`localStorage`).
- Grupos expansíveis; grupo do módulo atual abre automaticamente.
- Empresa/filial **somente leitura** na topbar (`.spec/02` §2.7 — sem
  seletor).

---

## 3.2 Padrão Lista (`<Entidade>ListaPage`)

Base do `DataTable` (`04-ui-kit.md` §4.4). Origem: `.spec/03` §3.2 + §3.9.

### Mobile (base) — busca + filtros em bottom sheet + lista de cards

```
▓ PageHeader: "Produtos"                              [+ Novo]  ← só com permissão
▓ [🔎 Buscar por descrição ou código de barras........] [Filtros •2]
│ ░
│ ┌─────────────────────────────────────────────┐
│ │ Dipirona 500mg 20cp            [Ativo]       │  ← 3–4 campos + chevron
│ │ 7891234560012 · R$ 12,90 · controla lote    │
│ └─────────────────────────────────────────────┘
│ ┌─────────────────────────────────────────────┐
│ │ ...                                          │
│ └─────────────────────────────────────────────┘
│ ░  [paginação: ‹ 1/8 ›  ·  160 registros]
```

- **Busca textual sempre visível** (debounce 400ms — `.spec/03` §3.9).
- `[Filtros]` abre bottom sheet com os filtros específicos da entidade
  (Grupo, `incluirInativos` etc.); badge com a contagem de filtros ativos.
  Rodapé do sheet: `[Limpar]` `[Aplicar]`.
- Card = os **3–4 campos mais relevantes** da linha do `PagedResult` + coluna
  de status como `<Tag>` + chevron. Toque no card → Detalhe.
- Ações de linha (inativar etc.) via swipe **não** são usadas — vão para o
  Detalhe (menos descoberta acidental). Exceção: ação rápida via long-press →
  action sheet, opcional pós-MVP.
- Paginação compacta (‹ n/total ›) sincronizada com a URL.
- `EmptyState` diferencia "nenhum registro" de "nenhum resultado para o
  filtro" (`.spec/03` §3.9).

### `md:` — tabela com colunas essenciais

Tabela com 4–5 colunas (as do card + 1–2), barra de filtros parcialmente
visível acima (busca + 1 filtro principal inline; resto em `[Filtros]`).
Linha clicável → Detalhe.

### `lg:`/`xl:` — tabela completa

Todas as colunas, barra de filtros completa acima da tabela (`.spec/03`
§3.9), ações inline na linha (ícones com tooltip, sob `<RequerPermissao>`),
seleção múltipla só se houver ação em lote real na fase.
`xl:` aproveita a largura extra em grids muito largos (Kardex, Posição) —
ver §3.7.

---

## 3.3 Padrão Formulário (`<Entidade>FormPage`)

Origem: `.spec/03` §3.2/§3.3. Serve criar e editar (id na URL decide).

### Mobile (base) — fluxo em etapas + barra de ação fixa

```
▓ topbar-form: [← Cancelar]   Novo produto            [• • • ○ ○ ○]  ← progresso das abas
│ ░
│ ┌ Passo 2 de 6 — Classificação ─────────────┐
│ │ [Departamento          ▾]                 │
│ │ [Grupo                 ▾]                 │
│ │ [Subgrupo              ▾]  (limpa se Grupo mudar)
│ │ ...                                       │
│ └──────────────────────────────────────────┘
│ ░
▓ barra fixa 56px:  [Voltar]              [Avançar]     ← último passo: [Salvar]
```

- As `<Tabs>` do desktop viram **`Steps` / fluxo em etapas** (uma seção por
  vez) — `agents.md` §4.2. Alternativa aceita: seletor de aba em `<Select>` no
  topo + conteúdo único abaixo (para formulários de 2–3 abas).
- Cabeçalho do passo mostra "Passo X de N — <nome da aba>" e um indicador de
  progresso com marcação de passos com erro de validação (ponto vermelho).
- **Navegação livre entre passos** (tocar no indicador) — não força wizard
  linear; validação é no submit final + inline por campo.
- Barra de ação **fixa no rodapé da viewport**, alvo ≥ 44px, `Salvar` à
  direita, `Voltar`/`Cancelar` à esquerda, com `safe-area-inset-bottom`.
- Campos condicionais aparecem/somem no lugar (disclosure progressivo), sem
  pular de passo.
- Ações de mudança de estado (`bloquear`, `inativar`…) **não** ficam aqui —
  só no Detalhe/Lista (`.spec/03` §3.2).

### `md:` — abas horizontais roláveis

`<Tabs>` horizontais com scroll, uma coluna de campos, barra de ação fixa no
rodapé do card.

### `lg:`/`xl:` — abas completas, multi-coluna

`<Tabs>` completas; dentro de cada aba, grid de 2 colunas (`xl:` até 3 para
blocos densos como "Regulatório"); `Affix` de `Salvar`/`Cancelar` no rodapé
do card (`.spec/03` §3.2). Aba com erro de validação recebe marcador
vermelho.

---

## 3.4 Padrão Detalhe (`<Entidade>DetalhePage`)

Usado quando há sub-recursos (endereços/contatos do Cliente, metas/débitos do
Vendedor, unidades/preços do Produto — `.spec/03` §3.2).

### Mobile (base)

```
▓ [← ]  Dipirona 500mg 20cp   [Ativo]              [ ⋯ ]  ← "⋯" abre action sheet
│ ░
│ [ Dados ] [ Preços ] [ Unidades ] [ Kardex ]     ← chips roláveis (seções)
│ ░ conteúdo da seção (cards empilhados) ░
```

- Ações (`Editar`, `Inativar`, `Definir preços`, `Bloquear`…) no **action
  sheet** do `[⋯]`, cada uma sob `<RequerPermissao>` e com `ConfirmDialog`
  quando destrutiva (`.spec/05` §5.4).
- Sub-listas (endereços, contatos, metas) = **lista de cards**; "adicionar"
  abre drawer de baixo para cima com o mini-formulário.
- Painel "Detalhes de auditoria" recolhido no fim (`.spec/03` §3.9).

### `lg:`

Cabeçalho com título + `<Tag>` de status + **barra de ações à direita**
(botões visíveis, não escondidos em menu). Abas horizontais. Sub-listas como
tabelas editáveis compactas. Auditoria em painel colapsado lateral ou ao pé.

---

## 3.5 Grid embutido (unidades alternativas, metas de comissão, contatos)

Origem: `agents.md` §4.2 última linha; `.spec/07` §7.3.2, `.spec/08` §8.6.3.

| | Mobile (base) | `md:` | `lg:` |
|---|---|---|---|
| Forma | lista vertical de **cards editáveis** (um card = uma linha) | tabela editável compacta | tabela editável completa |
| Adicionar | botão `[+ Adicionar <item>]` largura total → novo card em modo edição | linha nova no fim da tabela | idem |
| Editar | campos inline no card | célula inline | célula inline |
| Remover | botão de lixeira no card, com `ConfirmDialog` se já persistido | ícone na linha | ícone na linha |
| Validação (ex.: metas não podem sobrepor no tempo — `.spec/08` §8.6.3) | badge de conflito no card + resumo no topo do grid | marcador na linha | marcador na linha |

Salvamento segue o contrato da fase (ex.: `PUT /produtos/{id}/unidades`
substitui a lista inteira — a UI envia o array completo, não incrementos).

---

## 3.6 Drawer × Modal — quando usar cada um

| Situação | Componente | Motivo |
|---|---|---|
| Confirmar ação destrutiva (`inativar`, `bloquear`, `ajuste`) | **Modal** (`ConfirmDialog`) | foco total, exige decisão; campo de motivo quando o backend exige (`.spec/05` §5.4) |
| Criação rápida de cadastro de apoio (marca, grupo, segmento) sem sair do fluxo | **Modal** no `md:+`, **drawer de baixo** no mobile | tarefa curta, retorna ao formulário de origem (`.spec/07` §7.4) |
| Drill-down de leitura (Posição → saldo por lote; ver histórico) | **Drawer lateral** (`md:+`) / **drawer de baixo** (mobile) | contexto da lista permanece visível atrás; conteúdo pode ser longo (`.spec/09` §9.4) |
| Mini-formulário de sub-item (endereço de entrega, contato, faixa de meta) | **Drawer** | pode ter vários campos; não bloqueia como modal |
| Filtros de lista no mobile | **Bottom sheet** | ver §3.2 |

Largura de drawer lateral: `min(480px, 100vw)` no `md:`, `min(560px, 100vw)`
no `lg:`. Drawer de baixo (mobile): até `85vh`, com "puxador" e header fixo
com `[Fechar]`.

---

## 3.7 Telas densas de consulta (Kardex, Posição de Estoque)

`.spec/09` §9.5 diz explicitamente: no Kardex, **não esconder colunas** no
desktop — o auditor precisa da linha inteira.

### `lg:`/`xl:` — tabela com scroll horizontal + coluna fixa

```
▓ filtros: [Produto* ▾] [De 📅]–[Até 📅] [Depósito ▾]  [Aplicar]
│ ┌────────────┬───────── área de scroll horizontal ─────────────────────┐
│ │ Produto ▓  │ Data/hora │ Sentido │ Origem │ ... │ Saldo após ▓ │ ... │
│ │ (fixa)     │           │         │        │     │ (fixa dir.)  │     │
│ └────────────┴───────────────────────────────────────────────────────┘
```

- Primeira coluna (Produto) **sticky à esquerda**; "Saldo após" **sticky à
  direita** e em `body-strong` (`.spec/09` §9.5) — é o número que dá sentido
  ao kardex.
- Scroll horizontal contido na tabela; o `body` da página **nunca** rola na
  horizontal (`agents.md` "Responsive").
- `Sentido` e `Origem` como `<Tag>` (verde/vermelho, `01` §1.4).
- Cabeçalho da tabela sticky no topo durante scroll vertical.

### Mobile (base) — um card por movimento

```
│ ┌───────────────────────────────────────────┐
│ │ 02/09/2026 14:32        [Saída]  [Ajuste]  │
│ │ Depósito Central · Lote L2231 · venc 11/26 │
│ │ Qtd 30        Saldo após  1.470            │  ← "Saldo após" grande
│ │ Motivo: Quebra · obs: caixa danificada     │
│ │ por joão.silva                              │
│ └───────────────────────────────────────────┘
```

- Filtros obrigatórios (Produto + período) num bloco colapsável no topo; sem
  eles, `EmptyState` "Selecione um produto e um período para ver o kardex".
- "Saldo após" é o dado dominante do card (tamanho `h3`, `body-strong`).

Posição de Estoque segue o mesmo princípio: card por combinação
Produto × Depósito no mobile, com `<Tag>` "Abaixo do mínimo"; toque abre
drawer de detalhamento por lote (ordem FEFO — `.spec/09` §9.4).

---

## 3.8 Estados transversais

| Estado | Tratamento |
|---|---|
| Carregando lista | `<Table loading>` do antd = skeleton de linhas; **não** spinner central (`.spec/03` §3.12 espírito) |
| Carregando detalhe | skeleton de campos (blocos cinza `neutral/100`) |
| Vazio — sem registros | `EmptyState` com ilustração leve + texto + `[+ Novo]` (ex.: Depósitos: "Cadastre o depósito principal para começar" — `.spec/09` §9.2) |
| Vazio — sem resultado de filtro | `EmptyState` com texto diferente + `[Limpar filtros]` |
| Erro de carregamento | painel inline com `[Tentar novamente]`, nunca tela branca (`ErrorBoundary` só para erro de render — `.spec/04` §4.5) |
| Ação em progresso | botão com spinner + `disabled`, resto do formulário interativo |
| Sucesso de mutação | toast curto topo-direito + invalidação de cache (TanStack Query) |
| 403 em rota | página "Acesso negado" (`.spec/05` §5.5) — não redireciona em silêncio |
| 404 em detalhe | página "Não encontrado" com link de volta à lista |

---

## 3.9 Implementação (Etapa 2 — concluída 2026-09-03)

Cada padrão de `agents.md` §4.2 está implementado num componente genérico e
coberto por teste com viewport mockado (`tests/unit/responsivo.test.tsx` +
`tests/unit/_viewport.tsx`). Régua de breakpoints via
`compartilhado/hooks/useBreakpoint.ts` (valores **do Tailwind**: sm 640 / md
768 / lg 1024 / xl 1280) — não o `Grid.useBreakpoint` do antd (cujo `lg` é
992px).

| Padrão (§4.2) | Componente | `< md` | `md` | `lg+` |
|---|---|---|---|---|
| 1. Navegação | `AppShell` + `BottomNav`/`NavDrawer`/`SidebarNav` | bottom nav + drawer | drawer | sidebar fixa colapsável |
| 2. `DataTable` | `DataTable` | lista de cards | tabela sem colunas `apenasDesktop` | tabela completa |
| 3. Formulário | `FormPage` | fluxo em etapas (`Passo X de N`) + `BottomActionBar` | `<Tabs>` roláveis | `<Tabs>` + `Affix` no rodapé |
| 4. Detalhe | `DetailPage` | ações em `⋯` (action sheet) + chips de seção roláveis | idem | barra de ações visível + `<Tabs>` |
| 5. Grid embutido | `GridEmbutido` | cards editáveis + `[+ Adicionar]` largura total | tabela editável | tabela editável |
| 6. Filtros | `FiltrosResponsivos` | botão "Filtros" + bottom sheet (badge de contagem, `[Limpar]`/`[Aplicar]`) | barra inline | barra inline completa |

**Contenção de scroll horizontal:** `<main>` do `AppShell` tem
`min-w-0 overflow-x-clip`; conteúdo largo (Kardex/Posição) rola dentro do
próprio container do `DataTable` (`<Table scroll={{ x: 'max-content' }}>`).
O `body` nunca rola na horizontal.

**Protótipos** (sem código de tela de negócio) — `.spec/05` §5.4 critério de
pronto: `/estilo/lista` (`DataTable` + `FiltrosResponsivos` + tiers de coluna)
e `/estilo/formulario` (`FormPage` + `GridEmbutido` + `DetailPage`). Link no
showcase `/estilo`.
