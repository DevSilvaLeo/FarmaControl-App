---
título: agents.md — Regras de Engenharia Normativas do Frontend FarmaControl
versão do documento: 1.0
data: 2026-09-02
status: normativo — equivalente, no frontend, ao `agents.md` do backend
precedência: este documento **substitui** qualquer trecho de `01`, `02`, `03`
  e `12` desta mesma pasta que conflite com as decisões registradas aqui
  (ver §9 "O que muda nos demais documentos"). Onde não há conflito, os
  documentos `01-12` continuam valendo como estão.
---

# agents.md — Frontend FarmaControl

> Este arquivo é para quem (humano ou agente) vai efetivamente escrever
> código do frontend. Ele não substitui `01` a `12` — é a camada normativa
> que fixa três decisões novas pedidas pelo PO em 2026-09-02 (mobile-first,
> Tailwind CSS 3 como base de estilo, React 19) e consolida, num único
> lugar, as regras que já eram normativas em `03-padroes-de-engenharia-e-ui.md`.
> Em caso de dúvida sobre uma tela específica, ainda é preciso ler o
> documento de fase correspondente (`04` a `09`) — este arquivo não repete
> contrato de API, campo a campo.

## 0. Resumo das mudanças em relação à especificação v1.0

| Tópico | Estava especificado (`01`/`03`/`12`) | Passa a valer (este documento) | Motivo |
|---|---|---|---|
| Framework | React 18 | **React 19** | Projeto greenfield (zero linhas de código escritas), sem legado a migrar — não faz sentido nascer numa versão que já não é a atual. Ver §3. |
| Metodologia de layout | Desktop-first; mobile "utilizável mas não otimizado" abaixo de 1024px (`03` §3.13) | **Mobile-first**: toda tela é desenhada e implementada partindo do layout mobile (sem prefixo de breakpoint) e ganha complexidade progressivamente em telas maiores | Pedido explícito do PO. Ver §4. |
| Base de estilo | Ant Design tokens + CSS Modules pontual | **Tailwind CSS 3** como camada base de layout/espaçamento/tipografia/responsividade, com **Ant Design v6** para os componentes complexos (tabela, formulário, select, date picker) | Pedido explícito do PO ("Tailwind como base do design"), combinado com a razão original de `12` D-02 (não vale a pena reconstruir grid/formulário denso do zero). Ver §5. |
| Biblioteca de componentes | Ant Design **v5** | Ant Design **v6** | v6 é a major atual (lançada em 24/11/2025), pede React 18+ e recomenda oficialmente React 19 — é a combinação coerente com a decisão de subir para React 19. v6 também troca CSS-in-JS por CSS Variables puro, o que reduz atrito de convivência com Tailwind (ver §5.2). |

Tudo o que não está nesta tabela continua exatamente como especificado em
`01`, `02`, `03` e `12` (TypeScript, Vite, React Router v6, TanStack Query
v5, React Hook Form + Zod, Zustand, Axios, openapi-typescript, Vitest,
Testing Library, Playwright, estrutura de módulos, RBAC, contrato de erro,
datas em UTC, dinheiro em `decimal`, etc.).

## 1. Regra de dependência entre camadas (inalterada)

```
Paginas  →  Modulos (área de negócio)  →  Compartilhado (ui-kit, hooks, api-client)
```

Ver `02-arquitetura-e-estrutura.md` §2.1/§2.2 — continua valendo sem
alteração. A única adição estrutural é a pasta de estilo do Tailwind, ver
§5.4.

## 2. Stack tecnológica consolidada

| Camada | Escolha | Observação |
|---|---|---|
| Linguagem/build | TypeScript + Vite | Sem alteração — `01` §1.5 |
| Framework de UI | **React 19** | Alterado — ver §3 |
| Roteamento | React Router v6 | Sem alteração |
| Biblioteca de componentes | **Ant Design v6** | Alterado (era v5) — ver §5 |
| Estilo base / utilitários / responsividade | **Tailwind CSS 3** | Novo — ver §5 |
| Data fetching / cache | TanStack Query v5 | Sem alteração |
| Formulários | React Hook Form + Zod | Sem alteração |
| Estado global leve | Zustand | Sem alteração |
| Cliente HTTP | Axios com interceptors | Sem alteração |
| Geração de tipos | openapi-typescript | Sem alteração |
| Testes | Vitest + Testing Library (unidade/componente), Playwright (E2E) | Sem alteração |

## 3. Decisão: React 19

**Contexto.** `12` D-01 fixou React 18 quando a especificação foi escrita.
Nenhuma linha de código do frontend existe ainda (`00-indice.md`, "Estado
atual"). Um projeto que começa do zero em setembro de 2026 não tem motivo
para nascer numa versão que já não é a mais recente — não há custo de
migração porque não há código para migrar.

**Decisão.** Usar **React 19** desde o `npm create vite@latest` inicial
(template `react-ts`). `@types/react` e `@types/react-dom` na major 19.

**Consequência prática para as bibliotecas já decididas:**

- **Ant Design v6** é a versão que recomenda oficialmente React 19 (mínimo
  suportado: React 18) — por isso a subida de React force também a subida
  de v5 → v6 do antd (ver §5).
- React Router v6, TanStack Query v5, React Hook Form, Zod e Zustand já são
  compatíveis com React 19 — nenhuma mudança de decisão necessária nessas
  bibliotecas.
- Ao gerar o scaffold (`04-fase-0-fundacao.md`), confirmar no `package.json`
  gerado pelo Vite que as versões instaladas são realmente a major 19 antes
  de prosseguir — templates cacheados localmente podem estar desatualizados.

**Status.** Decidido. Registrar como D-14 em `12-decisoes-de-engenharia.md`
quando esse documento for atualizado (ver §9).

## 4. Decisão: Mobile-first como metodologia de design

**Contexto.** `01` §1.3 e `03` §3.13 tratavam responsividade mobile como
secundária ("desktop ≥1024px é o alvo otimizado; abaixo disso, apenas
utilizável"), justificado pelo perfil de uso interno/produtividade do ERP.
O PO decidiu inverter essa prioridade: o frontend precisa ser **mobile-first**.

**Decisão.** Mobile-first não é só "responsivo" — é a ordem em que o
trabalho é feito e a direção em que a complexidade é adicionada:

1. Todo componente e toda tela são **desenhados e implementados primeiro
   para a largura mobile** (o estilo sem prefixo de breakpoint no Tailwind
   é o estilo mobile, nunca um `@media (max-width:...)` aplicado depois).
2. Estados intermediários e o estado desktop são adições progressivas via
   `sm:`/`md:`/`lg:`/`xl:` (ver breakpoints em §4.1) — nunca o caminho
   inverso (estilo desktop como base + `max-width` sobrescrevendo para
   baixo).
3. Nenhuma tela é "apenas utilizável" em mobile — toda tela do MVP
   (`04` a `09`) precisa ser **operável** em smartphone (largura ~360–414px),
   mesmo as telas densas de cadastro (Produto, Cliente) e consulta (Kardex,
   Posição de Estoque). Isso substitui, para este projeto, a ressalva de
   `03` §3.13 ("formulários densos são otimizados para desktop e apenas
   utilizáveis abaixo disso").
4. Densidade de informação alta (`01` §1.3) continua sendo aceitável **no
   breakpoint desktop** — mobile-first não significa "simplificar o
   sistema", significa que a versão compacta/mobile é a base sobre a qual a
   versão densa/desktop é construída, e não o contrário.

### 4.1 Breakpoints

Usar os breakpoints padrão do Tailwind CSS 3 (não customizar sem motivo
forte — divergir do padrão custa consistência para ganho incerto):

| Prefixo | Largura mínima | Uso típico neste projeto |
|---|---|---|
| *(sem prefixo)* | 0px | Base mobile: coluna única, navegação em menu inferior/drawer, tabela vira lista de cards |
| `sm:` | 640px | Ajustes de smartphone grande / phablet |
| `md:` | 768px | Tablet — ponto em que colunas começam a aparecer lado a lado |
| `lg:` | 1024px | Desktop — layout denso completo (sidebar fixa, tabelas com todas as colunas, formulários em abas multi-coluna) |
| `xl:` | 1280px | Telas grandes — aproveita espaço extra em grids (Kardex, Posição de Estoque) |

### 4.2 Padrões de adaptação obrigatórios (mobile → desktop)

| Elemento | Mobile (base) | ≥`md:` | ≥`lg:` |
|---|---|---|---|
| Navegação principal (`AppShell`) | Menu inferior fixo ou drawer acionado por ícone hambúrguer | Drawer | Sidebar fixa expandida |
| `DataTable` (listas — Produto, Cliente, Kardex etc.) | Lista de cards (uma linha do `PagedResult` = um card com os 3–4 campos mais relevantes + ação) | Tabela com colunas essenciais | Tabela completa com todas as colunas e ações inline |
| Formulário com abas (`Tabs`, §6.2) | Abas viram um fluxo em etapas (`Steps`/acordeão) ou seletor de aba em dropdown, uma seção por vez | Abas horizontais roláveis | Abas horizontais completas |
| Botões de ação fixos do formulário (`Affix` "Salvar"/"Cancelar") | Barra fixa no rodapé da viewport (bottom bar), altura de toque ≥44px | Igual | `Affix` no rodapé do card do formulário, como já especificado em `03` §3.2 |
| Filtros de lista | Escondidos atrás de um botão "Filtros" (drawer/bottom sheet) + busca textual sempre visível | Barra de filtros parcialmente visível | Barra de filtros completa acima da tabela, como já especificado em `03` §3.9 |
| Grid embutido (ex.: unidades alternativas de Produto) | Lista vertical de cards editáveis | Tabela editável compacta | Tabela editável completa |

Esses padrões são a base — cada documento de fase (`04` a `09`), ao ser
detalhado ou revisado, deve confirmar/ajustar a adaptação mobile específica
da tela, mas a tabela acima é o comportamento padrão quando a fase não diz
nada em contrário.

### 4.3 O que mobile-first **não** muda

- Contrato de API, paginação, RBAC, tratamento de erro, datas, dinheiro —
  tudo isso é independente de layout e continua exatamente como em `03`
  §3.4 a §3.11.
- Continua fora de escopo app nativo (iOS/Android) e PWA/offline (`01`
  §1.6) — mobile-first aqui é sobre o **layout responsivo do mesmo SPA
  web**, não sobre construir um app nativo ou modo offline.
- RBAC/menu continuam filtrados por permissão (`01` §1.4) — mobile-first
  não introduz um "modo" diferente por dispositivo, só um layout diferente
  para o mesmo conjunto de dados/ações.

**Status.** Decidido. Registrar como D-15 em `12-decisoes-de-engenharia.md`.

## 5. Decisão: Tailwind CSS 3 como base + Ant Design v6 para componentes complexos

**Contexto.** `12` D-02 escolheu Ant Design porque reconstruir grid denso e
formulário de 35 campos do zero (rota shadcn/ui, ou Tailwind puro) custaria
tempo sem ganho relevante para um ERP interno. Essa razão continua válida —
por isso Tailwind **não substitui** Ant Design nesta decisão. O PO pediu
Tailwind CSS 3 especificamente como **base do design** (não a v4, que troca
o arquivo de configuração JS por configuração via CSS e ainda está
estabilizando seu ecossistema de plugins/integrações — v3 é a escolha mais
madura e previsível para conviver com uma biblioteca de componentes).

**Decisão.** Modelo híbrido, com responsabilidade clara por camada:

- **Tailwind CSS 3** é a base para: layout (`flex`/`grid`/`gap`),
  espaçamento, tipografia, cores de marca, breakpoints/responsividade
  (§4), e qualquer componente simples construído especificamente para este
  projeto (`PageHeader`, `EmptyState`, cards de KPI, badges de status
  fora do `<Tag>` do antd, etc. — ver `compartilhado/ui/`).
- **Ant Design v6** continua responsável pelos componentes complexos e
  interativos onde reconstruir do zero não compensa: `Table` (base do
  `DataTable` genérico), `Form`/`Input`/`Select`/`DatePicker`,
  `Tabs`/`Steps`, `Modal`/`Drawer`, `Upload`, `Affix`. Isso não muda em
  relação a `12` D-02 — só a versão muda (v5 → v6, ver §3).
- Nenhuma tela reconstrói em Tailwind puro um componente que o antd já
  resolve bem (mesma régua de `12` D-02) — a dúvida "Tailwind ou antd?" se
  resolve por essa tabela, não caso a caso.

### 5.1 Configuração para evitar conflito entre os dois

Tailwind e Ant Design têm, cada um, seu próprio reset de CSS — sem
configuração, os dois brigam (double reset, especificidade imprevisível).
Regras obrigatórias do setup inicial (`04-fase-0-fundacao.md`):

1. **Desligar o Preflight do Tailwind** (`corePlugins: { preflight: false }`
   em `tailwind.config.ts`) — o reset de base fica a cargo do Ant Design
   (`v6` já usa CSS Variables puro, sem depender de CSS-in-JS injetado em
   runtime, o que facilita a convivência).
2. **Ordem de import**: CSS reset/tokens do Ant Design carrega antes das
   camadas do Tailwind (`@layer base; @layer components; @layer utilities;`)
   no `main.tsx`/`index.css`, para que utilitários Tailwind (que têm maior
   especificidade intencional) sempre consigam sobrescrever quando
   necessário.
3. **Sincronizar tokens**: a paleta de cores, escala de espaçamento e
   raio de borda definidos em `tailwind.config.ts` (`theme.extend`) são a
   **fonte única** — o tema do `ConfigProvider` do antd (`compartilhado/tema/`,
   já citado em `02` §2.2) lê os mesmos valores (cor primária, tipografia)
   em vez de manter uma paleta paralela. Evita a paleta de marca divergir
   entre "os componentes antd" e "o resto da tela em Tailwind".
4. **Sem prefixo de classe** (`prefix: ''`) — como o Preflight está
   desligado e os componentes antd usam suas próprias classes `ant-*`,
   não há colisão de nome de classe esperada; revisar essa decisão apenas
   se um conflito real aparecer em code review.

### 5.2 Por que Ant Design v6 (não v5) para esta decisão funcionar melhor

Ant Design v6 (lançado em 24/11/2025) substitui a geração de estilo via
CSS-in-JS em runtime por **CSS Variables puras**. Isso é relevante para a
convivência com Tailwind: menos estilo injetado dinamicamente em `<style>`
tags concorrendo em especificidade com as classes utilitárias do Tailwind,
e tokens de tema expostos como variáveis CSS reais — mais fácil de
referenciar a partir de CSS custom ou até de classes arbitrárias do
Tailwind (`bg-[var(--ant-color-primary)]`) quando fizer sentido.

### 5.3 O que NÃO muda

- Todas as regras de `03-padroes-de-engenharia-e-ui.md` que não são sobre
  CSS/estilo (nomenclatura, padrão Lista→Formulário/Detalhe, validação
  Zod, tratamento de erro, RBAC, datas, dinheiro, paginação, testes)
  continuam exatamente como especificado.
- `compartilhado/ui/` continua sendo construído **sobre** os componentes
  antd (`12` D-02) — Tailwind entra como estilo de layout ao redor desses
  componentes, não como substituto deles.

### 5.4 Ajuste na estrutura de pastas (`02` §2.2)

Duas adições à árvore já especificada:

```
frontend/
├─ tailwind.config.ts       novo — tokens de tema, breakpoints (padrão, §4.1)
├─ postcss.config.js        novo — pipeline do Tailwind (autoprefixer)
├─ src/
│  ├─ compartilhado/
│  │  ├─ tema/              tokens do Ant Design — agora lidos de tailwind.config.ts (§5.1.3)
│  │  └─ estilos/           novo — index.css com as diretivas @tailwind, estilos globais mínimos
```

**Status.** Decidido. Registrar como D-16 em `12-decisoes-de-engenharia.md`.

## 6. Regras herdadas de `03-padroes-de-engenharia-e-ui.md` (sem alteração de conteúdo)

Resumo — ver o documento original para o detalhe completo, especialmente
tabelas de tradução de validação e mapeamento de erro:

- **Nomenclatura** (§3.1): nomes de negócio em PT-BR espelhando o backend;
  termos técnicos em inglês; convenção de arquivo `<Entidade><Acao>Page.tsx`,
  hook `use<Verbo><Entidade>`, schema `<entidade>Schema`.
- **Padrão de tela** (§3.2/§3.3): Lista → Formulário/Detalhe; abas por área
  de responsabilidade do dado quando >12 campos — em mobile, ver adaptação
  obrigatória em §4.2 desta.
- **Validação** (§3.4): Zod espelhando 1:1 o `FluentValidation` do backend.
- **Erros** (§3.5): normalização para `ErroApi`, mapeamento fixo por status
  HTTP, `useMutacaoComErro` único.
- **RBAC** (§3.6): `usePermissao`, `<RequerPermissao>`, chaves idênticas às
  do backend, nunca esconder no frontend sem policy correspondente na API.
- **Datas** (§3.7): UTC no transporte, `America/Sao_Paulo` só na exibição,
  componentes únicos `<DatePickerBr>`/`<DataHora>`.
- **Dinheiro/quantidades/enums** (§3.8): `Intl.NumberFormat`, `decimal.js`
  para cálculo local, enums como literais de string gerados do Swagger.
- **Paginação/filtros/tabelas** (§3.9): `PagedResult<T>` sincronizado com
  query string, debounce de 400ms, `EmptyState` diferenciado.
- **Segurança** (§3.10): frontend nunca é a única barreira.
- **Testes** (§3.12): Vitest + Testing Library (com `msw` na borda),
  Playwright contra API real para fluxos críticos.

## 7. Checklist obrigatório para toda nova tela (substitui `03` §3.11)

Mesma base do checklist original, com os itens 9 e 13 novos/ajustados:

1. Endpoint(s) da API já existem e foram conferidos no Controller real.
2. Tipos gerados (`api.gerado.ts`) atualizados (`npm run gerar-tipos`).
3. Funções de `api.ts` do módulo criadas/atualizadas.
4. Hooks de dados (TanStack Query) com chave de cache consistente.
5. Schema Zod criado/atualizado espelhando o Validator do backend.
6. Página(s) montada(s) sobre os componentes genéricos de
   `compartilhado/ui/` (Tailwind para layout, antd para os componentes
   complexos — §5).
7. Toda ação sensível envolvida em `<RequerPermissao>` com a chave correta.
8. Erros tratados via `useMutacaoComErro` — nenhum `try/catch` cru.
9. **Layout implementado mobile-first**: estilo base (sem prefixo) é o
   layout mobile; `md:`/`lg:`/`xl:` adicionam a versão desktop por cima —
   nunca o caminho inverso (§4).
10. Datas via `<DatePickerBr>`/`<DataHora>`; dinheiro via `<MoneyInput>`.
11. Teste unitário do schema + teste de componente da tela.
12. Item adicionado ao menu com a chave de permissão correspondente, e à
    rota com o guard correto.
13. **Verificado em pelo menos três larguras**: ~375px (mobile), ~768px
    (tablet/`md:`) e ~1280px (desktop/`xl:`) antes de considerar a tela
    pronta — checagem manual ou via teste de componente com viewport
    mockado, nunca só "funcionou no meu monitor".
14. Documento de fase correspondente (`04` a `09`) atualizado se o
    comportamento divergiu do especificado.

## 8. Setup inicial esperado (Fase 0)

Ordem sugerida para `04-fase-0-fundacao.md` incorporar estas decisões:

1. `npm create vite@latest frontend -- --template react-ts` (gera React 19
   por padrão nos templates atuais do Vite — confirmar versão instalada).
2. Instalar Tailwind CSS **3.x** (não a major 4) + PostCSS + Autoprefixer;
   gerar `tailwind.config.ts` com `corePlugins.preflight: false` (§5.1).
3. Instalar `antd` na major **6**; se algum warning de compatibilidade com
   React 19 aparecer antes da v6 estabilizar totalmente no projeto, o
   pacote de transição `@ant-design/v5-patch-for-react-19` existe como
   contingência apenas para quem ainda está em antd v5 — não deve ser
   necessário partindo direto de v6, mas vale checar o changelog do antd
   no momento da implementação real (essa decisão foi tomada em
   2026-09-02; se a Fase 0 só começar meses depois, revalidar que v6
   continua a recomendação atual).
4. Definir os tokens de tema (cor primária, tipografia, breakpoints) uma
   única vez em `tailwind.config.ts` e replicá-los no `ConfigProvider` do
   antd (§5.1.3) — não em dois lugares mantidos manualmente em sincronia
   por lembrança.
5. Construir o `AppShell` (`03`/`02`) já com o padrão de navegação
   mobile-first descrito em §4.2 (menu inferior/drawer em mobile, sidebar
   fixa em `lg:`).

## 9. O que muda nos demais documentos desta pasta

Este arquivo é a fonte de verdade para os três tópicos da tabela em §0. Os
documentos abaixo têm trechos que, lidos isoladamente, ainda descrevem a
decisão antiga — ficam desatualizados até serem revisados (não urgente para
uso deste `agents.md`, mas recomendado antes de iniciar a Fase 0):

| Documento | Trecho a revisar | Ajuste necessário |
|---|---|---|
| `01-visao-geral-e-stack.md` | §1.3 ("responsividade mobile são secundárias"); §1.5 (tabela de stack: React 18, sem Tailwind, "Ant Design tokens + CSS Modules") | Referenciar este `agents.md` como normativo para stack/responsividade |
| `03-padroes-de-engenharia-e-ui.md` | §3.13 ("formulários densos... apenas utilizáveis" abaixo de 1024px) | Substituir pela regra de §4 deste documento |
| `12-decisoes-de-engenharia.md` | D-01 (React 18), D-02 (antd v5, sem menção a Tailwind) | Acrescentar D-14 (React 19), D-15 (mobile-first), D-16 (Tailwind 3 + antd v6) conforme rascunhado em §3–§5 deste documento; D-01/D-02 passam a "status: superseded por D-14/D-16" |

Sugestão: na próxima revisão desses três documentos, copiar o conteúdo de
§3, §4 e §5 deste `agents.md` para dentro deles (nas seções indicadas),
mantendo este arquivo como o resumo/checklist de referência rápida.
