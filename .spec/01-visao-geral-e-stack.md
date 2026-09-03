---
título: Visão Geral e Stack Tecnológica — Especificação do Frontend FarmaControl
versão do documento: 1.0
data: 2026-09-02
fonte analisada: backend `api/TheOne.FarmaControl` (agents.md, .docs/00..12, .spec/00..14, código-fonte de Controllers/Application/Domain até a Fase 5 v0)
---

# 01 — Visão Geral e Stack Tecnológica

## 1.1 Objetivo deste conjunto de documentos

Este é o primeiro de uma série de documentos de especificação do **frontend do
FarmaControl** — a aplicação web que vai consumir a API REST já em construção
em `api/TheOne.FarmaControl` (.NET 10, ASP.NET Core, CQRS/MediatR, PostgreSQL).

Assim como o backend não foi especificado "do zero" (foi engenharia reversa de
um banco em produção — ver `.spec/00-visao-geral.md`), este frontend **não
está sendo especificado no vácuo**: ele nasce diretamente do que o backend já
entregou e documentou. Cada documento de fase aqui (`04` a `09`) espelha, tela
a tela e campo a campo, os Controllers, Commands, Queries e DTOs reais já
implementados nas Fases 0–5 do backend (ver `.docs/00-indice.md` do backend).
As fases ainda não implementadas no backend (Vendas, Compras, Fiscal,
Financeiro, Logística, Controlados, Licitações, OS/Produção, Sistema
avançado) são cobertas em nível de inventário de telas no documento `10`,
a partir da especificação funcional (`.spec/04` a `.spec/13`), para detalhamento
completo **quando cada fase for iniciada** — o mesmo método que o backend adota
(`.docs/05-roadmap-de-fases.md`, seção "Fases 6–7").

## 1.2 O que foi analisado para produzir esta especificação

| Fonte | Conteúdo | Uso nesta análise |
|---|---|---|
| `agents.md` (backend) | Regras de engenharia normativas: arquitetura em camadas, CQRS, nomenclatura PT-BR, paginação, erros, auth/RBAC | Base para os contratos que o frontend precisa respeitar (formato de erro, paginação, claims do JWT) |
| `.docs/00` a `.docs/12` (backend) | Estado real de implementação, decisões de engenharia (ADR-lite), roadmap de fases | Base para dividir este frontend nas mesmas fases e para herdar decisões já tomadas (ex.: FEFO, datas em UTC) |
| `.spec/00` a `.spec/14` (projeto) | Especificação funcional completa por área (14 áreas), fruto da engenharia reversa do banco legado `medDR` | Base para as telas de fases futuras (documento `10`) e para entender o *porquê* de cada campo |
| Código-fonte de `src/FarmaControl.API/Controllers/*.cs` | Rotas HTTP reais, políticas de autorização (`[Authorize(Policy = ...)]`), formato de request/response | Fonte de verdade para os contratos de API de cada tela nos documentos `04` a `09` |
| Código-fonte de `src/FarmaControl.Application/*/Contratos.cs`, `Gerenciar*.cs` | DTOs de resposta, Commands (payload de criação/edição), regras de validação (`FluentValidation`) | Fonte de verdade para os campos de formulário e mensagens de validação |
| `src/FarmaControl.Domain/Enums/*.cs` | Enums de domínio serializados como string | Fonte de verdade para os valores de `<Select>`/`<Radio>` de cada campo enumerado |

## 1.3 Perfil de negócio (herdado do backend, ver `.spec/00` §0.8)

O sistema **não é uma farmácia de varejo/balcão** — é um **ERP de
distribuição/atacado farmacêutico** B2B, vendendo para hospitais, clínicas,
outras farmácias e o setor público (licitações), com:

- controle regulatório de medicamentos controlados (SNGPC/ANVISA);
- estrutura fiscal completa (NF-e, NFS-e, CT-e, MDF-e, GNRE, SPED);
- logística própria de entrega;
- operação multiempresa/multifilial.

Isso importa diretamente para o frontend: as telas são de **uso interno,
atrás de login** (nunca público), operadas por funcionários especializados
(estoquista, vendedor interno/externo, financeiro, comprador, farmacêutico
responsável técnico, administrador) — não por consumidor final. Isso orienta
decisões de UX: densidade de informação alta é aceitável e até desejável
(grids densos, atalhos de teclado, telas com múltiplas abas), acessibilidade
e responsividade mobile são secundárias a produtividade em desktop (embora
não descartadas — ver `03-padroes-de-engenharia-e-ui.md` §3.9), e não há
requisito de SEO/renderização pública.

## 1.4 Personas e módulos (mapeamento área → quem usa)

| Persona | Áreas do sistema que mais usa |
|---|---|
| Administrador do sistema | Sistema (13): empresas/filiais, usuários, perfis/permissões |
| Estoquista / operador de depósito | Estoque (05): movimentações, posição, Kardex, lotes a vencer |
| Vendedor interno/externo | Clientes (02), Vendas (04 — futuro), Vendedores/comissão (03) |
| Comprador | Fornecedores (03), Compras (06 — futuro), Estoque (necessidade de compra) |
| Financeiro | Financeiro (08 — futuro), Clientes (limite de crédito/bloqueio) |
| Fiscal/contábil | Fiscal (07 — futuro), Produtos (classificação fiscal) |
| Farmacêutico responsável técnico | Controlados/Regulatório (10 — futuro), Produtos (registro MS, validade) |
| Logística/expedição | Logística (09 — futuro), Estoque (posição, separação) |
| Comercial/licitações | Licitações (11 — futuro) |

O menu principal do frontend (ver `04-fase-0-fundacao.md` §4.4) é filtrado
dinamicamente pelas permissões do usuário logado (`MeuPerfilDto.Permissoes`),
então cada persona só vê os módulos aos quais tem acesso — não há
diferenciação de "modo" por persona, é tudo dirigido por permissão granular,
exatamente como o backend modela (RBAC por `Perfil` composto de
`Permissões` — `agents.md` §14.4).

## 1.5 Stack tecnológica escolhida

Decisão registrada em `12-decisoes-de-engenharia.md` (D-01/D-02). Resumo:

| Camada | Escolha | Por quê |
|---|---|---|
| Linguagem/build | **TypeScript + Vite** | Build rápido, DX moderna, tipagem estática essencial para acompanhar ~200+ campos de DTOs em PT-BR sem erro de digitação |
| Framework de UI | **React 18** | Ecossistema maduro, maior disponibilidade de bibliotecas de grid/formulário para telas densas de ERP |
| Roteamento | **React Router v6** | Padrão de fato para SPA React; suporta rotas aninhadas (necessário para módulos com sub-telas) |
| Biblioteca de componentes | **Ant Design (antd) v5** | Componentes prontos e robustos para grids densos, formulários longos (Produto tem ~35 campos), filtros compostos, upload, date pickers — reduz drasticamente o esforço em telas como Kardex, cadastro de Produto/Cliente e, futuramente, NF-e/licitações. Escolha explícita do usuário/PO (ver `12`) |
| Data fetching / cache | **TanStack Query (React Query) v5** | Casa perfeitamente com o padrão `PagedResult<T>` + paginação 1-based da API; cache, invalidação, retry e loading states de graça |
| Formulários | **React Hook Form + Zod** | Performance em formulários grandes (Produto/Cliente); schemas Zod espelham 1:1 as regras `FluentValidation` do backend (ver `03` §3.4) |
| Estado global leve | **Zustand** (sessão/usuário logado, empresa/filial ativa, preferências de UI) | Mais simples que Redux para o volume de estado global real (autenticação + contexto), sem boilerplate |
| Cliente HTTP | **Axios** com interceptors | Necessário para o fluxo de refresh token rotativo (`agents.md` §14.1) — ver `05-fase-1-cross-cutting.md` |
| Geração de tipos da API | **openapi-typescript** a partir do `swagger.json` do backend | Elimina divergência manual entre DTO do C# e `interface` do TypeScript — ver `02-arquitetura-e-estrutura.md` §2.5 |
| Testes | **Vitest + Testing Library** (unidade/componente) e **Playwright** (E2E) | Mesma filosofia de "sem mocks de infraestrutura" do backend (`agents.md` §18) — Playwright roda contra a API real em ambiente de teste |
| Estilo | **Ant Design tokens + CSS Modules** pontual | Evita CSS global conflitante; tema customizado via `ConfigProvider` do antd |

Esta escolha é equivalente, em espírito, à decisão do backend de fixar
`MediatR`/`FluentValidation`/`Npgsql` (`.docs/06` D-07): tecnologia madura,
estável, com boa razão custo/benefício para um ERP de longa vida útil — não a
opção mais "na moda".

## 1.6 Fora de escopo (nesta rodada de especificação)

- Aplicativo mobile nativo (iOS/Android) — fora de escopo; o frontend web é
  responsivo o suficiente para consulta em tablet (ex.: conferência de
  separação no depósito), mas não há requisito de app nativo hoje.
- PWA/uso offline — não há requisito de operação sem conexão; o ERP depende
  de dados centralizados e em tempo real (estoque, preço, limite de crédito).
- Portal do cliente (self-service B2B) — mencionado como possível evolução
  futura (o legado tem `ecommercerastreio` — `.spec/09`), mas não faz parte
  do escopo interno especificado aqui.
- Internacionalização (i18n) — o sistema é 100% PT-BR (negócio, legislação
  fiscal brasileira, usuários brasileiros); não há requisito de múltiplos
  idiomas.

## 1.7 Estrutura dos documentos desta especificação

| # | Documento | Conteúdo |
|---|---|---|
| 00 | `00-indice.md` | Este índice |
| 01 | `01-visao-geral-e-stack.md` | Este documento |
| 02 | `02-arquitetura-e-estrutura.md` | Estrutura de pastas, roteamento, cliente de API, geração de tipos |
| 03 | `03-padroes-de-engenharia-e-ui.md` | Normativo: convenções de nomenclatura, padrões de tela, validação, erros, RBAC, testes |
| 04 | `04-fase-0-fundacao.md` | Scaffold do projeto, layout base, tema, roteamento esqueleto |
| 05 | `05-fase-1-cross-cutting.md` | Cliente HTTP, componentes genéricos, RBAC, tratamento global de erros |
| 06 | `06-fase-2-autenticacao.md` | Login, TOTP, Minha Conta, guarda de rotas |
| 07 | `07-fase-3-cadastros.md` | Empresas/Filiais, Geografia, Produtos, Cadastros de apoio, Clientes, Segmentos |
| 08 | `08-fase-4-fornecedores.md` | Fornecedores, Transportadoras, Representantes, Vendedores |
| 09 | `09-fase-5-estoque.md` | Depósitos, Movimentações, Posição, Kardex, Lotes a vencer |
| 10 | `10-fases-futuras-backlog.md` | Inventário de telas para Vendas, Compras, Fiscal, Financeiro, Logística, Controlados, Licitações, OS/Produção, Sistema |
| 11 | `11-roadmap-de-fases.md` | Ordem de entrega, dependências, escopo do MVP |
| 12 | `12-decisoes-de-engenharia.md` | ADR-lite das decisões de stack e de arquitetura frontend |

## 1.8 Estado atual do backend (o que já pode ser consumido hoje)

**Fase 5 (v0) do backend concluída** — os seguintes endpoints já existem e
estão prontos para consumo, o que define o MVP do frontend (documentos `04` a
`09`):

- Autenticação: login + senha, desafio TOTP, renovação de token, logout.
- Minha Conta: perfil, troca de senha, configurar/ativar/desativar 2FA.
- Usuários, Perfis e Permissões (RBAC administrativo).
- Empresas e Filiais.
- Geografia: países, estados, cidades, CEP.
- Produtos + cadastros de apoio (marcas, grupos, subgrupos, departamentos,
  laboratórios, unidades).
- Clientes + segmentos, endereços, contatos.
- Fornecedores, Transportadoras, Representantes, Vendedores (+ metas de
  comissão, débitos).
- Estoque: depósitos, entrada/saída/ajuste avulsos, posição, Kardex, lotes a
  vencer.

Ainda **não implementado no backend** (logo, apenas especificado em nível de
inventário no documento `10`, sem tela detalhada): Vendas/Pedidos, Compras,
Fiscal, Financeiro, Logística, Controlados/Regulatório avançado, Licitações,
OS/Produção, Sistema avançado (parâmetros, agendador, integrações).

Próximo passo do backend, por `.docs/05`: `PR 5b` (transferência/inventário/
endereçamento) ou Fase 6 — Vendas. O frontend deste MVP (documentos `04` a
`09`) pode começar a ser construído **imediatamente e em paralelo**, já que
toda a base (auth, cadastros, estoque) está pronta e estável na API.
