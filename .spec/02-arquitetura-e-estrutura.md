---
título: Arquitetura e Estrutura do Projeto — Frontend FarmaControl
versão do documento: 1.0
data: 2026-09-02
---

# 02 — Arquitetura e Estrutura do Projeto

## 2.1 Visão geral

SPA (Single Page Application) React + TypeScript servida separadamente da
API (`FarmaControl.API`), consumindo-a exclusivamente via HTTP/JSON REST. Sem
SSR. Build com Vite. Regra de dependência entre camadas, adaptada da regra do
backend (`agents.md` §3):

```
Paginas  →  Modulos (área de negócio)  →  Compartilhado (ui-kit, hooks, api-client)
```

- **Páginas** (`app/rotas/`) só compõem módulos e cuidam de layout de rota.
- **Módulos** (`modulos/<area>/`) contêm a lógica e os componentes de UI de
  uma área de negócio (ex.: `modulos/produtos/`), e podem depender de
  `compartilhado/`, nunca de outro módulo diretamente (comunicação entre
  módulos passa por rota/URL ou por um evento global, nunca por import
  cruzado — evita acoplamento entre Produtos e Estoque, por exemplo).
- **Compartilhado** (`compartilhado/`) não depende de nenhum módulo — é a
  base reutilizável (componentes de UI genéricos, cliente HTTP, hooks de
  autenticação/permissão, utilitários de formatação).

## 2.2 Estrutura de pastas

```
frontend/
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ .env.example                  VITE_API_BASE_URL, VITE_APP_NOME etc.
├─ package.json
├─ openapi/
│  └─ farmacontrol.schema.json   snapshot do swagger.json do backend (versionado)
├─ src/
│  ├─ main.tsx                   bootstrap: ConfigProvider (antd), QueryClientProvider, Router
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ rotas/                  definição de rotas (React Router), uma por módulo
│  │  ├─ layout/                 AppShell (topbar + sidebar + breadcrumb + conteúdo)
│  │  └─ providers/              composição de providers (Query, Auth, Tema, ErrorBoundary)
│  ├─ modulos/
│  │  ├─ autenticacao/           login, TOTP, minha-conta (Fase 2)
│  │  ├─ sistema/                empresas, filiais, usuários, perfis/permissões (Fase 2/3)
│  │  ├─ geografia/               países, estados, cidades, CEP (Fase 3)
│  │  ├─ produtos/                produtos + cadastros de apoio (Fase 3)
│  │  ├─ clientes/                clientes + segmentos (Fase 3)
│  │  ├─ fornecedores/            fornecedores, transportadoras, representantes (Fase 4)
│  │  ├─ vendedores/              vendedores, metas, débitos (Fase 4)
│  │  ├─ estoque/                 depósitos, movimentações, posição, kardex (Fase 5)
│  │  ├─ vendas/                  (Fase 6 — backlog, pasta criada vazia quando iniciar)
│  │  ├─ compras/                 (Fase 7 — backlog)
│  │  └─ ...                      uma pasta por área de `.spec/`, criada quando a fase começa
│  ├─ compartilhado/
│  │  ├─ ui/                      DataTable, FormPage, ConfirmDialog, SelectAutocomplete,
│  │  │                           MoneyInput, DatePickerBr, PageHeader, EmptyState, ErroApi
│  │  ├─ api/                     cliente Axios, interceptors, tipos gerados do Swagger
│  │  ├─ auth/                    contexto de sessão, hook usePermissao, RequerPermissao
│  │  ├─ hooks/                   usePaginacao, useFiltrosDeUrl, useDebounce etc.
│  │  ├─ utils/                   formatarMoeda, formatarData, cpfCnpj, validadores
│  │  └─ tema/                    tokens do Ant Design (cores, tipografia)
│  └─ tipos/
│     └─ api.gerado.ts            saída do openapi-typescript (NÃO editar à mão)
├─ tests/
│  ├─ unit/                       Vitest + Testing Library, espelha src/
│  └─ e2e/                        Playwright, um arquivo por fluxo crítico
└─ .github/workflows/ci.yml       lint + typecheck + testes unitários a cada PR
```

Cada pasta de módulo segue o mesmo layout interno (convenção obrigatória,
igual ao backend padronizar `Commands/Queries/Dtos/Interfaces` por área —
`agents.md` §4):

```
modulos/<area>/
├─ paginas/          componentes de página completos (ex.: ProdutoListaPage.tsx)
├─ componentes/       peças específicas do módulo, não reutilizadas fora dele
├─ hooks/             hooks de dados do módulo (ex.: useListarProdutos, useProduto)
├─ api.ts             funções que chamam o cliente HTTP para os endpoints do módulo
├─ tipos.ts           tipos específicos do módulo além dos gerados do Swagger
└─ validacao.ts       schemas Zod dos formulários do módulo
```

## 2.3 Roteamento

React Router v6, rotas aninhadas dentro do `AppShell`. Convenção de URL em
português, espelhando a rota da API sempre que fizer sentido para o usuário
(a URL da API é interna; a URL do frontend é o que o usuário vê/compartilha):

| Módulo | Prefixo de rota |
|---|---|
| Autenticação | `/entrar`, `/entrar/dois-fatores` (públicas) |
| Minha Conta | `/minha-conta` |
| Sistema | `/sistema/empresas`, `/sistema/usuarios`, `/sistema/perfis` |
| Geografia | `/geografia/cidades` (tela de manutenção; a maior parte do uso é via autocomplete embutido em outras telas) |
| Produtos | `/produtos`, `/produtos/novo`, `/produtos/:id`, `/produtos/apoio/marcas` etc. |
| Clientes | `/clientes`, `/clientes/novo`, `/clientes/:id` |
| Fornecedores | `/fornecedores`, `/fornecedores/:id` |
| Transportadoras | `/transportadoras`, `/transportadoras/:id` |
| Representantes | `/representantes` |
| Vendedores | `/vendedores`, `/vendedores/:id` |
| Estoque | `/estoque/depositos`, `/estoque/posicao`, `/estoque/kardex`, `/estoque/lotes-a-vencer`, `/estoque/entrada`, `/estoque/saida`, `/estoque/ajuste` |

Toda rota (exceto `/entrar*`) passa por um `GuardaAutenticacao` (redireciona
para `/entrar` se não há sessão válida) e, quando aplicável, por um
`GuardaPermissao` (redireciona para uma página "Acesso negado" se o usuário
não tem a permissão exigida pela rota — ver `03-padroes-de-engenharia-e-ui.md`
§3.6). O mapeamento rota → permissão fica centralizado em
`app/rotas/mapaDePermissoes.ts`, nunca espalhado dentro de cada página.

## 2.4 Cliente HTTP e camada de API

Um único cliente Axios (`compartilhado/api/clienteHttp.ts`) configurado com:

- `baseURL` = `VITE_API_BASE_URL` (ex.: `http://localhost:5138/api` em dev).
- Interceptor de requisição: injeta `Authorization: Bearer <accessToken>`.
- Interceptor de resposta: em `401`, tenta renovar via
  `POST /autenticacao/token/renovar` uma única vez (fila de requisições
  pendentes aguarda a renovação — nunca duas renovações simultâneas); se a
  renovação falhar, desloga e redireciona para `/entrar`.
- Mapeamento de erro: toda resposta de erro (400/404/409/422/423/500) é
  normalizada para um tipo `ErroApi` único antes de chegar ao componente —
  ver `03-padroes-de-engenharia-e-ui.md` §3.5 para o contrato completo.

Cada módulo expõe funções tipadas em `api.ts` que usam esse cliente — nunca
`fetch`/`axios` direto dentro de um componente de página. Exemplo (padrão a
seguir em todo módulo):

```ts
// modulos/produtos/api.ts
export const produtosApi = {
  listar: (params: ListarProdutosParams) =>
    clienteHttp.get<PagedResult<ProdutoResumoDto>>('/produtos', { params }),
  obterPorId: (id: number) =>
    clienteHttp.get<ProdutoDto>(`/produtos/${id}`),
  criar: (dados: DadosProduto) =>
    clienteHttp.post<number>('/produtos', { dados }),
  atualizar: (id: number, dados: DadosProduto) =>
    clienteHttp.put(`/produtos/${id}`, dados),
  // ...
};
```

## 2.5 Geração de tipos a partir do Swagger

O backend já expõe Swagger/OpenAPI (`Swashbuckle.AspNetCore`, `.docs/06` D-09).
Em vez de recriar manualmente cada `interface` TypeScript a partir dos DTOs em
C# (processo propenso a erro e a ficar desatualizado — o backend tem dezenas
de DTOs com 20-35 campos cada, como `ProdutoDto` e `ClienteDto`), o frontend
gera os tipos automaticamente:

```bash
npx openapi-typescript http://localhost:5138/swagger/v1/swagger.json \
  -o src/tipos/api.gerado.ts
```

Regras:
- `src/tipos/api.gerado.ts` **nunca é editado à mão** — é regenerado a cada
  mudança de contrato do backend, e commitado (para builds reproduzíveis sem
  precisar da API no ar).
- Um script `npm run gerar-tipos` encapsula o comando acima; roda contra
  `VITE_API_BASE_URL` local por padrão.
- O CI valida que `api.gerado.ts` está sincronizado com um snapshot
  versionado (`openapi/farmacontrol.schema.json`) — falha o build se alguém
  esquecer de regenerar após mudar o backend (mesmo espírito do teste de
  arquitetura do backend, `agents.md` §3, que falha o build se a regra de
  dependência for violada).
- Tipos específicos de módulo que não vêm da API (ex.: estado de um filtro de
  tela) ficam em `tipos.ts` do próprio módulo, nunca misturados com
  `api.gerado.ts`.

## 2.6 Ambientes e configuração

| Variável | Uso |
|---|---|
| `VITE_API_BASE_URL` | URL base da API (ex.: `http://localhost:5138/api`) |
| `VITE_APP_NOME` | Nome exibido no topbar/título da aba (ex.: "FarmaControl") |
| `VITE_SENTRY_DSN` *(opcional, pós-MVP)* | Rastreamento de erro em produção |

Sem segredo algum no frontend (é código público servido ao navegador) — nada
de chave de API, connection string ou segredo TOTP aparece aqui. Compare com
a postura do backend, que versiona segredos de **desenvolvimento** local
(`.docs/06` D-06) exatamente porque nunca são segredos de produção; o
frontend não tem segredo nenhum, nem de desenvolvimento.

## 2.7 Empresa/Filial — escopo de dados

O backend amarra `EmpresaId`/`FilialId` ao usuário autenticado (claims do JWT
— `agents.md` §14.1) e filtra automaticamente toda consulta por
`EmpresaAtualId` (`.docs/06` D-26/D-27). **Não existe, hoje, troca de empresa
sem novo login** — cada usuário pertence a uma única empresa/filial
(`Usuario.EmpresaId`/`FilialId`, fixos). Consequência direta para o
frontend: **não há seletor de empresa/filial na UI** neste MVP — a empresa
atual é apenas exibida (somente leitura) no topbar, lida das claims do token
decodificado. Um seletor de troca de empresa é backlog explícito, a avaliar
apenas se o backend vier a suportar múltiplas empresas por usuário (ver
`12-decisoes-de-engenharia.md` D-06).

## 2.8 Build e deploy

- `npm run build` gera estático (`dist/`) — sem servidor Node em produção,
  servido por qualquer CDN/servidor estático (Nginx, Azure Static Web Apps
  etc.), atrás de HTTPS.
- CORS: a API precisa liberar a origem do frontend (`AllowedOrigins` em
  `appsettings`) — item a confirmar com o backend antes da Fase 0 (ver
  `04-fase-0-fundacao.md` §4.2, pré-requisito).
- Sem SSR, então não há requisito de runtime Node em produção — reduz
  superfície de operação a "servir arquivos estáticos", compatível com o
  perfil de time enxuto observado no backend (`.docs/04-runbook-local.md`).
