---
título: Etapas e Roadmap de UX — Frontend FarmaControl
versão do documento: 1.0
data: 2026-09-02
status: normativo — plano de execução da camada de design. Alinhado ao
        roadmap de engenharia `.spec/11` (Fases 0–5) e às decisões de
        `agents.md` (React 19, Vite, Tailwind 3 + antd v6, mobile-first).
---

# 05 — Etapas e Roadmap de UX

## 5.1 Visão geral

| # | Etapa | Entregável | Espelha | Depende de |
|---|---|---|---|---|
| 0 | Realinhamento de fundação | Migração CRA→Vite; Tailwind 3 + antd v6 + React 19; token único; AppShell mobile-first; `/diagnostico` | `.spec/04` (Fase 0) | — |
| 1 | Design System — tokens & UI Kit | Tokens (`02`), componentes próprios + wrappers antd (`04`), showcase `/estilo` | `.spec/05` (Fase 1) | 0 |
| 2 | Blueprints responsivos | Os 6 padrões da `agents.md` §4.2 implementados nos genéricos + documentados (`03`) | `agents.md` §4.2 | 1 |
| 3 | Autenticação & Sistema | Login, 2FA, Minha Conta, Usuários, Perfis, Empresas; menu por permissão; 403/404 | `.spec/06` (Fase 2) | 2 |
| 4 | Cadastros centrais | Produto (6 abas) e Cliente (5 abas) mobile-first; apoio; CEP | `.spec/07` (Fase 3) | 3 |
| 5 | Parceiros & força de vendas | Fornecedor/Transportadora/Representante + `CamposDadosParceiro`; Vendedor + metas/débitos | `.spec/08` (Fase 4) | 3 |
| 6 | Estoque operacional | Depósitos; entrada/saída/ajuste; Posição; Kardex; Lotes a vencer | `.spec/09` (Fase 5) | 3 |
| 7 | Painel inicial | KPIs por permissão, widget Lotes a Vencer, ações rápidas | placeholder `.spec/04`/`09` | 6 |
| 8 | Acessibilidade & QA visual | Auditoria AA da paleta; passe de teclado; checklist 3 larguras; regressão visual | `agents.md` §7, `.spec/03` §3.13 | contínua; fecha ao fim |

Sequência: **0 → 1 → 2** são pré-requisito de tudo. **3** precede 4/5/6 (RBAC
real). **4, 5, 6** são paralelizáveis. **7** após 6. **8** é contínua e
formalmente fechada ao final do MVP.

Marcos (alinhados a `.spec/11` §11.3): Etapa 0 ⇒ M1 · Etapas 0–2 ⇒ M2 ·
+3 ⇒ M3 · +4 ⇒ M4 · +5 ⇒ M5 · +6 ⇒ M6 (fecha o MVP).

---

## 5.2 Etapa 0 — Realinhamento de fundação

**Por que existe.** O repositório está em **Create React App** (`react-scripts
5.0.1`), enquanto `agents.md` §2/§8 exige **Vite**. Tailwind e Ant Design não
estão instalados. Começar a Etapa 1 sobre CRA criaria a base inteira em stack
divergente da norma.

**Escopo:**
1. `npm create vite@latest` (template `react-ts`); portar `src/` mínimo; remover
   `react-scripts` e artefatos de CRA (`reportWebVitals`, `setupTests` legado,
   `public/manifest.json` de PWA — PWA está fora de escopo, `.spec/01` §1.6).
   Confirmar React **major 19** no `package.json` gerado (`agents.md` §3).
2. Instalar e configurar: React Router v6, Ant Design **v6**
   (`locale={ptBR}`), Tailwind CSS **3.x** (não v4) + PostCSS + Autoprefixer
   com `corePlugins.preflight: false`, TanStack Query v5, Axios, Zustand,
   React Hook Form + Zod, `openapi-typescript` (dev), Vitest + Testing
   Library, Playwright.
3. `tailwind.config.ts` + `src/compartilhado/tema/tokens.ts` +
   `temaAntd.ts` — paleta de `01`, escalas de `02`, **fonte única**
   (`agents.md` §5.1.3). Ordem de import de CSS conforme `02` §2.8.
4. Estrutura de pastas de `.spec/02` §2.2 + as adições de `agents.md` §5.4
   (`compartilhado/estilos/`, `tailwind.config.ts`, `postcss.config.js`),
   com `.gitkeep`.
5. `main.tsx`: `ConfigProvider` (tema + `ptBR`) → `QueryClientProvider` →
   `BrowserRouter` → `ErrorBoundary` global (`.spec/04` §4.5).
6. `AppShell` **já mobile-first** (`03` §3.1): bottom nav + drawer no mobile,
   sidebar fixa colapsável no `lg:`. Menu estático nesta etapa (sem filtro de
   permissão — entra na Etapa 3).
7. Rotas esqueleto: `/entrar` (placeholder), `/` privada renderizando o
   AppShell com "Painel" placeholder, `/diagnostico` no rodapé do menu.
8. Página **Diagnóstico**: consome `GET /api/diagnostico` via TanStack Query
   (nome, versão, ambiente, hora UTC) — prova de integração ponta a ponta.
9. ESLint (`typescript-eslint` + plugins react/react-hooks) + Prettier.
10. CI mínimo: `npm ci`, `lint`, `typecheck`, `test:unit`, `build` como gate.

**Pré-requisito externo:** CORS liberado na API para `http://localhost:5173`
(`.spec/04` §4.2, PAF-02) — levantar com o backend antes de começar.

**Critério de pronto:**
- `npm run dev` e `npm run build` sem erro; `lint`/`typecheck` limpos.
- AppShell navegável e responsivo em 375/768/1280.
- Diagnóstico exibindo dados reais da API local.
- Tailwind e antd v6 convivendo sem "double reset" (checar em code review).
- CI verde no primeiro PR.

---

## 5.3 Etapa 1 — Design System (tokens & UI Kit)

**Escopo:**
- Formalizar em código todos os tokens de `02` (cor, espaço, tipo, raio,
  sombra, motion) e os tokens semânticos por papel.
- Construir os **componentes próprios** de `04` §4.2: `PageHeader`,
  `SectionCard`, `StatusTag`, `SemaforoValidade`, `KpiCard`, `BottomActionBar`,
  `EmptyState`, `LinhaDoTempoDeStatus` (antecipado), `Marca`.
- Construir os **wrappers sobre antd** de `04` §4.3: `DataTable` (com modo
  card mobile), `FormPage` (abas→steps mobile), `MoneyInput`, `DatePickerBr`/
  `DataHora`, `SelectAutocomplete`, `ConfirmDialog`, `CampoCep`.
- `useMutacaoComErro` com o mapeamento dos 7 status de `.spec/03` §3.5.
- Hooks utilitários: `usePaginacao`, `useFiltrosDeUrl`, `useDebounce`
  (`.spec/05` §5.7).
- `usePermissao()` + `<RequerPermissao>` com dado **mockado** (login real só
  na Etapa 3) — `.spec/05` §5.6.
- Rota showcase `/estilo` (`04` §4.7) documentando cada token/componente.
- Set de ícones de domínio (`04` §4.6).
- Sistema de notificação centralizado (`04` §4.5).

**Critério de pronto** (= `.spec/05` §5.8):
- Todos os componentes existem, no showcase, cobertos por teste de componente,
  verificados em 375/768/1280.
- `useMutacaoComErro` testado nos 7 casos de status.
- Renovação de token testada, incluindo fila de requisições simultâneas
  (`.spec/05` §5.2).
- Nenhuma tela de negócio criada — 100% infraestrutura.

### Notas de implementação (Etapa 1 — concluída 2026-09-03)

Divergências e decisões registradas (disciplina de `.spec/03` §3.11 item 12):

- **`DataTable.usarConsulta`**: assinatura simplificada para
  `() => UseQueryResult<PagedResult<T>>` (o hook de consulta do módulo lê
  paginação/filtros da URL por conta própria via `usePaginacao`/
  `useFiltrosDeUrl`), em vez do `(filtros, paginacao) => …` esboçado em
  `.spec/05` §5.3 — mesma responsabilidade, menos acoplamento.
- **`usePermissao` — mock de dev**: enquanto não há login (Etapa 3), sem
  `perfil` na sessão e em `import.meta.env.DEV`, o hook libera tudo, a menos
  que `VITE_PERMISSOES_MOCK='off'`. Em produção, sem perfil ⇒ sem permissão.
- **`useMutacaoComErro` no 403**: em contexto de *mutação* usa toast (a página
  "Acesso negado" é para *rotas*, via guarda — Etapa 3). O 401 é silencioso
  (o interceptor do `clienteHttp` já renova ou desloga).
- **Renovação de token**: interceptor + single-flight (`renovacaoDeToken.ts`)
  implementados e testados (2 requisições concorrentes ⇒ 1 chamada). O
  contrato exato de `POST /autenticacao/token/renovar` é fixado na Etapa 3.
- **Datas**: conversão UTC↔`America/Sao_Paulo` via `dayjs` + plugins
  `utc`/`timezone` (dayjs já é peer do antd) em vez de adicionar `date-fns-tz`.
- **Testes**: `jsdom` recebe polyfills de `ResizeObserver`, `matchMedia` e
  `scrollTo` no `tests/unit/setup.ts` (exigidos por Modal/Drawer/Tabs do antd).
- Deps adicionadas nesta etapa: `zustand`, `react-hook-form`,
  `@hookform/resolvers`, `zod`, `decimal.js`.

**Gates locais:** lint / typecheck / test:unit (37) / build — verdes.
Bundle ~1,1 MB (antd + decimal.js + dayjs) — code-splitting fica para a
Etapa 8 (otimização), não é bloqueio.

---

## 5.4 Etapa 2 — Blueprints responsivos

**Escopo:** garantir que os 6 padrões de adaptação de `agents.md` §4.2 estão
**implementados nos componentes genéricos** (não só documentados) e cobertos
por teste com viewport mockado:

1. Navegação (`AppShell`) — bottom nav/drawer/sidebar.
2. `DataTable` — card list / tabela essencial / tabela completa.
3. `FormPage` — steps / abas roláveis / abas multi-coluna.
4. Detalhe — action sheet / barra de ações.
5. Grid embutido — cards editáveis / tabela editável.
6. Filtros — bottom sheet / barra parcial / barra completa.

Entregável de documentação: `03-blueprints-responsivos.md` com mockup de cada
padrão nas 3 larguras + regras drawer×modal + tratamento de Kardex/Posição.

**Critério de pronto:**
- Um "protótipo de lista" e um "protótipo de formulário" genéricos (dados
  falsos) demonstram os 3 breakpoints sem código específico de tela.
- Teste de componente com viewport mockado para cada padrão.
- `body` nunca rola na horizontal em nenhuma largura (Kardex incluso).

### Notas de implementação (Etapa 2 — concluída 2026-09-03)

- **`useBreakpoint`** (`compartilhado/hooks/`) passa a ser a fonte única da
  decisão responsiva em JS, com os breakpoints **do Tailwind** (lg = 1024).
  `DataTable` e `FormPage` migraram de `Grid.useBreakpoint` do antd (lg = 992)
  para ele — remove o descompasso CSS↔JS.
- **Componentes novos:** `FiltrosResponsivos` (bottom sheet no mobile),
  `DetailPage` (action sheet `⋯` no mobile, barra visível no desktop),
  `GridEmbutido` (cards ↔ tabela editável). `DataTable` ganhou o tier
  intermediário via `apenasDesktop` por coluna (oculta na faixa `md`).
- **Contenção de scroll horizontal:** `<main>` do `AppShell` com
  `min-w-0 overflow-x-clip`; tabelas largas rolam no próprio container.
- **Protótipos:** rotas `/estilo/lista` e `/estilo/formulario` (sem código de
  negócio) — link no showcase `/estilo`. Detalhamento em `.docs/03` §3.9.
- **Testes:** `tests/unit/_viewport.tsx` (`mockViewport`/`renderEm`) +
  `tests/unit/responsivo.test.tsx` (13 casos, um par por padrão).
- Deprecações do antd v6 corrigidas de passagem: `Tabs.tabPosition` →
  padrão, `Drawer.height` → `styles.wrapper`.

**Gates locais:** lint / typecheck / test:unit (50) / build — verdes.

---

## 5.5 Etapas 3–6 — Telas de negócio

O detalhamento de UX tela a tela está nos documentos de fluxo:

| Etapa | Documento de fluxo | Espelha `.spec/` |
|---|---|---|
| 3 — Autenticação & Sistema | [`06-fluxo-autenticacao-sistema.md`](06-fluxo-autenticacao-sistema.md) | `.spec/06` |
| 4 — Cadastros centrais | [`07-fluxo-cadastros-produto-cliente.md`](07-fluxo-cadastros-produto-cliente.md) | `.spec/07` |
| 5 — Parceiros & força de vendas | [`08-fluxo-parceiros-forca-vendas.md`](08-fluxo-parceiros-forca-vendas.md) | `.spec/08` |
| 6 — Estoque operacional | [`09-fluxo-estoque.md`](09-fluxo-estoque.md) | `.spec/09` |

Cada tela dessas etapas segue o **checklist obrigatório** de `agents.md` §7 —
com destaque para os itens 9 (layout mobile-first: base sem prefixo é o
mobile) e 13 (verificado em 375/768/1280).

O critério de pronto de cada etapa é o do documento `.spec` correspondente
(`.spec/06` §6.11, `.spec/07` §7.7, `.spec/08` §8.7, `.spec/09` §9.7),
acrescido de: "verificado nas 3 larguras" e "sem regressão no showcase
`/estilo`".

### Notas de implementação (Etapa 3 — Autenticação & Sistema, 2026-09-03)

- **Sessão:** `BootstrapSessao` faz renovação silenciosa + carrega
  `GET /minha-conta` no start; após login/2FA os hooks também carregam o
  perfil antes de `autenticado` virar `true` (senão o `GuardaAutenticacao`
  faria loop).
- **Guardas:** `GuardaAutenticacao` (layout route → `<Outlet/>`),
  `GuardaPermissao` (renderiza "Acesso negado", não redireciona). Mapa
  rota→permissão em `app/rotas/mapaDePermissoes.ts`.
- **Menu por permissão:** `useMenuVisivel()` filtra `menuConfig`; usado por
  Sidebar/Drawer/BottomNav. Grupo sem filho visível some.
- **Formulários:** `CampoTexto` (novo, em `compartilhado/ui/`) liga campos ao
  React Hook Form via **`Controller`** — `register` cru não funciona com
  inputs do antd (ref/onChange não são de `<input>` nativo). Padrão para as
  Etapas 4+.
- **2FA:** `Input.OTP` do antd para o código de 6 dígitos (auto-submit);
  `qrcode.react` para o QR. O fluxo `ConfiguracaoTotpObrigatoria` (primeiro
  acesso) usa o token de escopo restrito como bearer temporário — **a
  reconciliar com o backend** quando a API estiver acessível.
- **Contratos de API:** `modulos/autenticacao/api.ts` e `modulos/sistema/api.ts`
  espelham `.spec/06` (Controllers reais), mas os nomes de campo dos DTOs
  ainda **não foram conferidos contra o Swagger** — rodar `npm run gerar-tipos`
  e reconciliar `api.gerado.ts` assim que a API subir (`agents.md` §7 itens 1–2).
- **Listas não paginadas** (Perfis, Empresas — `IReadOnlyList`): `DataTable`
  ganhou `semPaginacao` + helper `usarListaComoPaged`.
- **E2E:** `tests/e2e/login.spec.ts` criado; pulado sem `E2E_LOGIN`/`E2E_SENHA`
  + API de teste no ar (não roda no CI atual).
- Deprecação do antd v6 corrigida de passagem: `<Alert message>` → `title`.

**Gates locais:** lint / typecheck / test:unit (61) / build — verdes.
Bundle ~1,6 MB (514 KB gzip) — code-splitting por rota fica para a Etapa 8.

### Notas de implementação (Etapa 4 — Produto & Cliente, 2026-09-03)

Construída **contra o Swagger real** (backend levantado localmente). Detalhe
em `07` §7.8. Pontos principais:

- **`CampoEndereco`** (`modulos/geografia/componentes/`): CEP autopreenche via
  `GET /geografia/ceps/{n}` + Estado→Cidade (autocomplete escopado pelo estado).
- **Campos de formulário reutilizáveis** em `compartilhado/ui/campos.tsx`
  (`CampoSelect`/`CampoSwitch`/`CampoNumero`/`CampoMoeda`/`CampoData`) — todos
  via `Controller` do RHF. Reduzem drasticamente o markup das Etapas 4+.
- **`aplicarErrosDeCampo`** (`compartilhado/api/errosDeFormulario.ts`): mapeia o
  400 do backend nos campos, tratando o prefixo `Dados.` e o PascalCase.
- Cadastros de apoio (Marca/Grupo/Depto/Subgrupo/Lab/Unidade e Segmentos) via
  modais dentro do próprio formulário; endereços/contatos do Cliente são
  **append-only** (o backend só expõe `POST`).
- Ações separadas mantidas: `PUT .../precos`, `PUT .../unidades`,
  `PUT .../limite-credito`, `POST .../bloquear`.

**Gates:** lint / typecheck / test:unit (71) / build — verdes.

---

## 5.6 Etapa 7 — Painel inicial

Ver [`09-fluxo-estoque.md`](09-fluxo-estoque.md) §9.7. Resumo: transformar o
"Painel" placeholder da Etapa 0 num painel real assim que Estoque existir —
KPIs dirigidos por permissão (produtos abaixo do mínimo, lotes a vencer em 30
dias, clientes bloqueados), widget "Lotes a Vencer" (`.spec/09` §9.6 já
registra a intenção), e ações rápidas por persona. Mobile-first: pilha de
`KpiCard`; `lg:` grid de 3–4 + widget largo.

Landing por permissão: o usuário cai no primeiro módulo a que tem acesso se
não tiver acesso ao Painel — **sem** "modo por dispositivo" ou "modo por
persona" (`.spec/01` §1.4).

---

## 5.7 Etapa 8 — Acessibilidade & QA visual (gate de fechamento)

**Escopo:**
- **Auditoria formal de contraste AA** de toda a paleta final com ferramenta
  (axe / Stark / contrast-checker) — fecha o PAF-01 de `.spec/04` §4.7 e
  cumpre `.spec/03` §3.13. Corrigir qualquer par abaixo de 4.5:1 (texto) /
  3:1 (UI). Ver pares já pré-validados em `01` §1.7.
- Passe de **navegação por teclado** em todos os formulários (ordem de tab
  lógica, foco visível, `Esc` fecha modal/drawer, `Enter` submete) — não
  quebrar o que o antd já entrega (`.spec/03` §3.13).
- `prefers-reduced-motion` conferido (`02` §2.6).
- **Checklist das 3 larguras** (375/768/1280) executado em toda tela do MVP —
  `agents.md` §7 item 13.
- **Regressão visual** com Playwright: screenshot das telas-chave (Login,
  Lista de Produtos, Form de Produto, Kardex, Posição, Painel) nas 3 larguras;
  baseline versionado; diff no CI.
- Revisão de textos: PT-BR consistente, termos de negócio espelhando o backend
  (`.spec/03` §3.1), rótulos de enum via `rotulosEnum.ts`.
- Atualização final destes documentos `.docs` com qualquer divergência
  encontrada (mesma disciplina de `.spec/03` §3.11 item 12).

**Critério de pronto:**
- Zero violação AA de contraste na paleta e nos componentes do kit.
- Zero armadilha de teclado; foco sempre visível.
- Suíte de regressão visual verde e versionada.
- Checklist das 3 larguras assinado para cada tela do MVP.

---

## 5.8 Fases futuras (6+ — bloqueadas pelo backend)

Quando o backend entregar Vendas, Compras, Fiscal etc. (`.spec/10`,
`.spec/11` §11.2), cada área ganha:
- um documento de fluxo de UX `.docs/1X-fluxo-<area>.md` no nível de
  detalhe de `06`–`09` daqui;
- reuso de `LinhaDoTempoDeStatus` (já no kit) para a máquina de estados do
  Pedido/OS (`.spec/10` §10.2);
- fluxo estruturado de "aprovação de exceção" (modal com motivo pré-definido +
  aprovador + observação — nunca texto livre, `.spec/10` §10.2 RF-04.06).

Não construir nada dessas telas especulando contrato (`.spec/12` D-13).
