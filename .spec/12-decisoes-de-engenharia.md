---
título: Decisões de Engenharia (ADR-lite) — Frontend FarmaControl
versão do documento: 1.0
data: 2026-09-02
---

# 12 — Decisões de Engenharia (ADR-lite)

Registro curto de decisões, no mesmo espírito de `.docs/06-decisoes-de-
engenharia.md` do backend: cada decisão relevante fica registrada aqui, com
contexto, decisão e status — nunca só na memória de quem especificou.

---

## D-01 — Stack: React + TypeScript + Vite

**Contexto**: o backend já fixou sua stack (.NET 10, EF Core, MediatR —
`.docs/06` D-07). O frontend precisava de uma decisão equivalente antes de
qualquer especificação de tela ser útil.
**Decisão**: React 18 + TypeScript + Vite, com React Router v6 para
roteamento. Escolhido explicitamente pelo usuário/PO entre as opções
apresentadas (React+Vite vs. Next.js vs. Angular) — SSR do Next.js
descartado por não haver requisito de SEO/renderização pública (aplicação
interna atrás de login, `01` §1.3); Angular descartado por curva de
aprendizado maior sem benefício claro para este time/projeto.
**Consequência**: toda a estrutura de `02-arquitetura-e-estrutura.md` e os
componentes genéricos de `05-fase-1-cross-cutting.md` assumem este stack.

## D-02 — Biblioteca de componentes: Ant Design (antd) v5

**Contexto**: o sistema tem formulários muito densos (Produto: 35 campos;
Cliente: 30+ campos) e telas de grid pesadas (Kardex, Posição de Estoque) —
construir cada componente do zero (rota shadcn/ui) custaria tempo
significativo sem ganho de diferenciação visual relevante para um ERP
interno.
**Decisão**: Ant Design v5, escolhido explicitamente pelo usuário/PO. Tema
customizado via `ConfigProvider`/tokens (paleta ainda placeholder, `04`
§4.7 PAF-01).
**Consequência**: os componentes genéricos (`DataTable`, `FormPage` etc.)
são construídos **sobre** os componentes antd (`Table`, `Form`, `Select`,
`DatePicker`), nunca substituindo-os — evita reinventar o que o antd já
resolve bem (acessibilidade de teclado, `03` §3.13).

## D-03 — Data fetching: TanStack Query, nunca fetch/axios cru em componente

**Contexto**: toda listagem da API segue o mesmo contrato `PagedResult<T>` +
`ParametrosPaginacao` (`agents.md` §11 do backend) — um padrão repetitivo
que se beneficia de cache/invalidação automática.
**Decisão**: TanStack Query como única forma de buscar/mutar dados de
servidor. Chave de cache padronizada por módulo (`[modulo, 'lista', filtros]`
/ `[modulo, 'detalhe', id]`), invalidação automática após toda mutação bem-
sucedida (criar/editar/inativar invalida a lista do módulo).
**Consequência**: nenhuma tela implementa `useEffect` + `fetch` manual —
violação disso é bloqueante em revisão de código (checklist `03` §3.11).

## D-04 — Validação client-side: Zod espelhando 1:1 o FluentValidation

**Contexto**: o backend valida com `FluentValidation` (`agents.md` §7);
sem uma tradução disciplinada, o frontend tende a divergir silenciosamente
(campo que o backend rejeita mas o frontend deixa passar, gerando erro 400
tardio e frustrante).
**Decisão**: cada `Validator` do backend tem um schema Zod correspondente,
mantido no mesmo PR quando o backend muda uma regra (`03` §3.4/§3.11 item 5
e 12). A validação do backend continua soberana — o Zod é conveniência de
UX, nunca a barreira de segurança (`03` §3.10).
**Consequência**: processo de PR do frontend exige checar o Validator real
do backend antes de escrever o schema — nunca "adivinhar" a regra pelo tipo
do campo.

## D-05 — Armazenamento de sessão: access token em memória, refresh token em `localStorage`

**Contexto**: o backend emite um par de tokens — access token JWT de vida
curta e refresh token opaco rotativo, com detecção de reuso
(`agents.md` §14.1) — via corpo de resposta JSON, não via cookie
`httpOnly` (o backend não implementa cookie de sessão nesta fase).
**Decisão**: `accessToken` fica **apenas em memória** (estado Zustand, não
persistido) — nunca sobrevive a um F5 sozinho, reduzindo a janela de
exposição a XSS. `refreshToken` fica em `localStorage` (necessário para
sobreviver a F5/fechar aba sem forçar novo login) — aceitando o risco
residual de XSS sobre esse token específico, mitigado por: (a) o backend já
detectar e revogar reuso de refresh token roubado (`agents.md` §14.1), e
(b) a lista de dependências de terceiros do frontend ser mantida enxuta
(evitar pacotes desnecessários que ampliem a superfície de XSS).
**Status**: decisão pragmática para o MVP, a **revisar** se o backend vier
a suportar refresh token via cookie `httpOnly` + `SameSite=Strict` (opção
mais segura, mas exige mudança de contrato no backend — não está no escopo
atual do backend documentado em `.docs`). Registrar como dívida técnica
conhecida, não como decisão definitiva.

## D-06 — Sem seletor de empresa/filial na UI

**Contexto**: o backend amarra `EmpresaId`/`FilialId` ao usuário de forma
fixa (`Usuario.EmpresaId/FilialId`, `.docs/06` D-24) e filtra toda consulta
por `EmpresaAtualId` das claims do JWT (`.docs/06` D-26/27) — não existe,
hoje, conceito de "trocar de empresa" na mesma sessão.
**Decisão**: o frontend não constrói seletor de empresa/filial — apenas
exibe (somente leitura) a empresa/filial atual no topbar, lida do token
(`02` §2.7).
**Status**: a revisitar se/quando o backend suportar múltiplas
empresas por usuário — não há sinalização disso em `.docs`/`agents.md`
hoje, então não antecipar essa UI.

## D-07 — RBAC: esconder na UI é UX, nunca segurança

**Contexto**: o backend já lista, como anti-padrão proibido, "permissão
verificada só no front-end, sem policy correspondente no endpoint"
(`agents.md` §17 do backend).
**Decisão**: toda ocultação de UI por permissão (`<RequerPermissao>`, `03`
§3.6) é estritamente um espelho do que a API já impõe — nunca a única
proteção. Se uma ação precisa ser bloqueada e o endpoint correspondente
não tem policy, isso é bug de especificação do **backend** a reportar, não
algo a "resolver" escondendo no frontend.
**Consequência**: qualquer PR de frontend que adicione uma nova
`<RequerPermissao>` deve linkar a policy correspondente no Controller do
backend na descrição do PR, como evidência.

## D-08 — Datas: UTC no transporte, `America/Sao_Paulo` na exibição

**Contexto**: o backend serializa tudo em UTC e delega a conversão de fuso
explicitamente ao frontend (`agents.md` §13 do backend, citado
literalmente em `03` §3.7 desta especificação).
**Decisão**: conversão centralizada em dois componentes únicos
(`<DatePickerBr>`/`<DataHora>`) — proibido formatar data manualmente em
qualquer tela.
**Consequência**: um único ponto de manutenção se o fuso de operação mudar
(ex.: expansão para outro país/fuso no futuro).

## D-09 — Dinheiro: `Intl.NumberFormat('pt-BR', {currency:'BRL'})` + biblioteca decimal para cálculo local

**Contexto**: o backend usa `decimal` (nunca `double`/`float`,
`agents.md` §13 do backend) para todo valor monetário — `number` do
JavaScript/TypeScript tem imprecisão de ponto flutuante que pode divergir
do cálculo do backend em centavos, gerando desconfiança do usuário
("o sistema calculou errado").
**Decisão**: toda exibição usa `Intl.NumberFormat`; todo cálculo client-
side de preview (ex.: margem antes de salvar, `10` §10.8) usa uma
biblioteca de precisão decimal (`decimal.js`), nunca aritmética `number`
crua para dinheiro.

## D-10 — Enums: literais de string idênticos ao backend, rótulo em mapa separado

**Contexto**: o backend serializa enum como string (`JsonStringEnumConverter`,
`agents.md` §13 do backend) — ex.: `"Cif"`/`"Fob"`, não `1`/`2`.
**Decisão**: os tipos TypeScript de enum vêm do `openapi-typescript` (gerados,
`02` §2.5) — nunca redigitados à mão. O rótulo amigável em português (ex.:
"CIF — frete por conta do remetente") vive num mapa próprio
(`rotulosEnum.ts`), nunca hardcoded dentro de um componente de tela
específico — permite reuso do mesmo enum em múltiplas telas com o mesmo
rótulo, e um único ponto de correção se o texto mudar.

## D-11 — Tipos TypeScript gerados do Swagger, nunca escritos à mão

**Contexto**: os DTOs do backend têm até 35 campos (`ProdutoDto`) e mudam
conforme o backend evolui — manter `interface` TypeScript sincronizada à
mão é fonte garantida de bug de digitação e de divergência silenciosa.
**Decisão**: `openapi-typescript` contra o `swagger.json` real do backend
(`02` §2.5), com verificação de sincronismo no CI.
**Consequência**: qualquer mudança de contrato do backend é, por
construção, detectável no CI do frontend (o `api.gerado.ts` desatualizado
falha o build) — reduzindo o risco que normalmente existiria de um time de
frontend trabalhar "cego" em relação a mudanças de backend.

## D-12 — Testes E2E contra API real, nunca só mocks, para fluxos críticos

**Contexto**: o backend proíbe InMemory/SQLite em teste de integração,
preferindo Postgres real via Testcontainers (`agents.md` §18 do backend) —
o mesmo raciocínio de "não confiar em substituto barato de infraestrutura"
se aplica ao frontend.
**Decisão**: Playwright roda os fluxos críticos (`03` §3.12) contra uma API
de teste real (não `msw`) — `msw` fica reservado para teste de componente
isolado (mais rápido, roda em CI sem subir a API completa), nunca para
validar o fluxo ponta a ponta que mais importa para o negócio.

## D-13 — Um documento de fase por fase do backend, nunca um documento único "telas do sistema"

**Contexto**: poderia se optar por um único documento gigante listando
todas as telas do sistema de uma vez.
**Decisão**: seguir a mesma divisão em fases do backend (`04` a `09` +
backlog em `10`), com dependência explícita de qual endpoint cada fase
consome — torna cada documento **verificável** (é possível abrir o
Controller citado e confirmar se a especificação está certa) e mantém o
frontend sempre honestamente alinhado ao que a API realmente oferece, em vez de
especular contratos que podem mudar antes do backend implementar.
