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
