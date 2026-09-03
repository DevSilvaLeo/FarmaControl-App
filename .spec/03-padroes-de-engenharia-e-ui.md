---
título: Padrões de Engenharia e UI — Frontend FarmaControl (normativo)
versão do documento: 1.0
data: 2026-09-02
---

# 03 — Padrões de Engenharia e UI (normativo)

> Este documento é o equivalente, no frontend, ao `agents.md` do backend: as
> regras aqui **não são opcionais**. Toda nova tela deve segui-las. Onde este
> documento cita um contrato do backend (formato de erro, paginação, claims),
> a fonte de verdade é o código real do backend, não a memória de quem
> escreve a tela — em caso de dúvida, checar `agents.md` e o Controller
> correspondente.

## 3.1 Nomenclatura

- **Nomes de negócio em PT-BR**, espelhando o backend (`agents.md` §6):
  componentes, funções, variáveis e rotas usam os mesmos termos que o
  backend usa nos seus DTOs/Commands — `Produto`, `Cliente`, `Fornecedor`,
  `bloquear`, `inativar`, `ObterPorId`. Isso elimina a tradução mental
  constante entre o payload que chega da API e o que a tela mostra.
- **Termos técnicos permanecem em inglês**, como no backend: `hook`,
  `component`, `props`, `state`, `handler`, `query`, `mutation`.
- Arquivo de página: `<Entidade><Acao>Page.tsx` (ex.: `ProdutoListaPage.tsx`,
  `ProdutoFormPage.tsx`, `ProdutoDetalhePage.tsx`).
- Hook de dados: `use<Verbo><Entidade>` (ex.: `useListarProdutos`,
  `useProduto`, `useCriarProduto`, `useInativarProduto`) — verbo no
  infinitivo, igual ao Command/Query do backend (`CriarProdutoCommand` →
  `useCriarProduto`).
- Schema de validação: `<entidade>Schema` (ex.: `produtoSchema`) em
  `validacao.ts` do módulo.

## 3.2 O padrão de tela: Lista → Formulário/Detalhe

Toda área de cadastro (Produtos, Clientes, Fornecedores, Vendedores,
Depósitos etc.) segue o mesmo esqueleto de três telas, montado sobre os
componentes genéricos de `compartilhado/ui/` (especificados em
`05-fase-1-cross-cutting.md`):

1. **Lista** (`<Entidade>ListaPage`): `DataTable` paginado consumindo
   `PagedResult<T>`, com barra de filtros acima (busca textual +
   filtros específicos da entidade, ex.: `incluirInativos`, `grupoId`),
   coluna de status (`Ativo`/`Inativo` como `<Tag>`), e ação "Novo" no
   canto superior direito (visível apenas com a permissão `*.Gerenciar`).
   Clique na linha navega para o Detalhe.
2. **Formulário** (`<Entidade>FormPage`): usado tanto para criar quanto
   editar (mesma tela, `id` na URL decide o modo). Campos organizados em
   `<Tabs>` quando a entidade tem mais de ~12 campos (Produto, Cliente,
   Fornecedor) — ver §3.3 para o critério de agrupamento. Botões
   "Salvar" e "Cancelar" fixos no rodapé (`Affix`), sempre visíveis mesmo
   com scroll.
3. **Detalhe** (`<Entidade>DetalhePage`) — usado apenas quando a entidade
   tem sub-recursos que não cabem no formulário de edição (ex.: endereços e
   contatos do Cliente, metas e débitos do Vendedor, Kardex do Produto).
   Quando a entidade é simples (ex.: Depósito, Segmento), Detalhe e
   Formulário são a mesma tela.

Ações de mudança de estado (`bloquear`, `desbloquear`, `inativar`,
`reativar`, `definir-padrao`) **nunca** ficam dentro do formulário de edição
— são botões próprios na barra de ações do Detalhe/Lista, cada um atrás de
um `ConfirmDialog` (padrão do backend: cada uma dessas ações é um endpoint
`POST` próprio e idempotente, não um campo editável do payload de
atualização — ver `ProdutosController`/`ClientesController`).

## 3.3 Critério de agrupamento em abas (formulários grandes)

Baseado na estrutura real dos DTOs do backend. Exemplo de referência —
`ProdutoDto` (35 campos) organizado como:

| Aba | Campos |
|---|---|
| Dados gerais | Descrição, descrição etiqueta, códigos de barras, código de referência, ativo |
| Classificação | Departamento, Grupo, Subgrupo, Marca, Laboratório, Fornecedor principal, Tipo de medicamento |
| Estoque | Unidade de estoque, quantidade por embalagem, estoque mínimo/máximo, controla lote, controla série, validade mínima (dias), considera estoque inteiro, unidades alternativas (grid embutido) |
| Preços | Preço de custo, custo médio (somente leitura), preço de venda, margem padrão, percentual de comissão |
| Regulatório | Controlado, monitorado SNGPC, exige receita, registro MS, validade do registro, bloqueia venda se registro vencido, princípio ativo, DCB |
| Fiscal | NCM, CEST, origem da mercadoria |

O mesmo critério (uma aba por "área de responsabilidade" do dado, nunca uma
aba por tabela do banco legado) se aplica a `ClienteDto` (Dados gerais /
Endereços / Contatos / Financeiro e crédito / Fiscal e retenções) — ver
detalhamento em `07-fase-3-cadastros.md`.

## 3.4 Validação — espelhando o FluentValidation do backend

Cada Command do backend tem um `Validator` (`FluentValidation`) com regras
explícitas. O frontend **replica cada regra em um schema Zod equivalente**,
para dar feedback instantâneo (sem round-trip) — mas a validação do backend
continua sendo a autoridade final (nunca confiar só no frontend, ver §3.10).

Tabela de tradução de regra (referência, expandir por campo em cada módulo):

| FluentValidation (backend) | Zod (frontend) |
|---|---|
| `NotEmpty()` | `.min(1, 'Campo obrigatório')` |
| `MaximumLength(120)` | `.max(120, 'Máximo de 120 caracteres')` |
| `GreaterThan(0)` | `.positive('Deve ser maior que zero')` |
| `GreaterThanOrEqualTo(0)` | `.nonnegative()` |
| `Matches(@"^\d{8}$")` (NCM) | `.regex(/^\d{8}$/, 'NCM deve ter 8 dígitos')` |
| `.When(condição)` | `.superRefine()` ou `.refine()` condicional |
| `IsInEnum()` | `z.nativeEnum(...)` ou `z.enum([...])` gerado a partir do enum do Swagger |

Exemplo (`DadosProdutoValidator` do backend → `produtoSchema` do frontend):

```ts
export const produtoSchema = z.object({
  descricao: z.string().min(1, 'Informe a descrição').max(120),
  departamentoId: z.number().positive('Selecione o departamento'),
  grupoId: z.number().positive('Selecione o grupo'),
  unidadeEstoqueId: z.number().positive('Selecione a unidade'),
  precoVenda: z.number().positive('Preço de venda deve ser maior que zero'),
  precoCusto: z.number().nonnegative(),
  quantidadePorEmbalagem: z.number().positive(),
  codigoBarras: z.string().max(50).optional(),
  ncm: z.string().regex(/^\d{8}$/, 'NCM deve ter 8 dígitos').optional().or(z.literal('')),
  validadeMinimaDias: z.number().positive().optional(),
});
```

Regra de manutenção: **sempre que um Validator do backend mudar, o schema
Zod correspondente muda no mesmo PR do frontend** (ou o PR fica marcado
"dessincronizado" — ver checklist §3.11). Isso é análogo à obrigação do
backend de manter `.docs/` atualizado a cada fase.

## 3.5 Tratamento de erros — contrato com `ExceptionMiddleware`

O backend mapeia toda exceção de negócio para um `ProblemDetails` estendido
(`agents.md` §12). O cliente HTTP (`compartilhado/api/clienteHttp.ts`)
normaliza toda resposta de erro para:

```ts
type ErroApi = {
  status: number;
  mensagem: string;              // ProblemDetails.mensagem ou .title
  codigoErro?: string;
  erros?: Record<string, string[]>; // erros de validação por campo (400)
};
```

Mapeamento de tratamento por status (regra fixa, não decidir caso a caso):

| Status | Origem no backend | Tratamento padrão no frontend |
|---|---|---|
| 400 | `ValidationException` | Marca cada campo do formulário com o erro de `erros[campo]` (via `setError` do React Hook Form) — nunca só um toast genérico |
| 401 | Token inválido/expirado | Interceptor já tentou renovar (§2.4); se persistir, desloga e redireciona para `/entrar` |
| 403 | Falha de policy | Página "Acesso negado" (nunca deveria acontecer se o menu/rota já filtra por permissão — se acontecer, é sinal de menu dessincronizado, logar no console em dev) |
| 404 | `EntidadeNaoEncontradaException` | Página "Não encontrado" (em detalhe) ou remove otimisticamente da lista |
| 409 | `ConflitoDeEstadoException` / unicidade (`23505`) | Toast de erro com a `mensagem` do backend (ex.: "código de barras já está em uso") — nunca genérico |
| 422 | `RegraNegocioException` / FK inválida (`23503`) | Toast de erro com a `mensagem` do backend — é sempre uma regra de negócio explicável ao usuário |
| 423 | `ContaBloqueadaException` (login) | Mensagem específica na tela de login |
| 500 | Não tratado | Toast genérico "Ocorreu um erro inesperado. Tente novamente." — nunca mostrar stack trace ou detalhe interno ao usuário (o backend já garante isso na origem, `agents.md` §12) |

Toda mutação (`useMutation` do TanStack Query) usa esse mapeamento por
padrão via um wrapper único (`useMutacaoComErro`), nunca `try/catch` manual
repetido em cada tela.

## 3.6 RBAC no frontend

- Hook `usePermissao()` lê `MeuPerfilDto.Permissoes` (carregado uma vez no
  login e mantido em `Zustand`) e expõe `tem(chave: string): boolean` e
  `temAlgumaDe(chaves: string[]): boolean`.
- Componente `<RequerPermissao chave="Produtos.Gerenciar">` envolve
  qualquer ação/botão sensível — se o usuário não tem a permissão, o
  conteúdo simplesmente não renderiza (nunca `disabled` sem explicação, nem
  esconder com CSS).
- As chaves de permissão usadas no frontend **são as mesmas strings** que
  `PermissoesConhecidas` define no backend (`Produtos.Consultar`,
  `Produtos.Gerenciar`, `Estoque.MovimentarEntrada` etc.) — mantidas em
  `compartilhado/auth/permissoes.ts` como constantes, geradas/copiadas de
  `GET /api/permissoes` (nunca strings soltas espalhadas pelas telas,
  mesma regra do backend em `agents.md` §14.4).
- Um perfil com a claim `perfil=Administrador` sempre tem acesso a tudo
  (espelha `PermissaoAuthorizationHandler` do backend) — o frontend também
  trata esse caso no `usePermissao`, para não esconder menus do
  administrador por engano.
- **Anti-padrão proibido** (mesma lista do `agents.md` §17 do backend):
  esconder uma ação no frontend **sem** que o endpoint correspondente tenha
  a política de autorização — a UI só reflete o que a API já impõe, nunca
  o contrário. Se uma tela precisa esconder algo que a API não protege,
  isso é bug de especificação a reportar, não a "resolver" só no frontend.

## 3.7 Datas e fuso horário

O backend serializa **todas as datas em UTC** e delega a conversão para
timezone local ao frontend (`agents.md` §13, explícito: "Conversão para
timezone local é responsabilidade exclusiva do cliente/front-end"). Regras:

- Toda data vinda da API (`...Utc` no nome do campo, ex.: `NascimentoUtc`,
  `ValidadeUtc`, `DataMovimentoUtc`) é convertida para o fuso
  `America/Sao_Paulo` **apenas na exibição** (usar `date-fns-tz` ou
  `Intl.DateTimeFormat` com `timeZone: 'America/Sao_Paulo'`).
- Todo `DatePicker`/`RangePicker` de formulário envia de volta **UTC** ao
  montar o payload — nunca a hora local crua.
- Formato de exibição padrão: `dd/MM/yyyy` para datas, `dd/MM/yyyy HH:mm`
  para data+hora (Kardex, auditoria). Nunca ISO cru (`2026-09-02T...`) na
  tela.
- Componente único `<DatePickerBr>`/`<DataHora>` em `compartilhado/ui/`
  encapsula essa conversão — proibido formatar data manualmente em cada
  tela (fonte comum de bug de fuso horário).

## 3.8 Dinheiro, quantidades e enums

- Valores monetários: `Intl.NumberFormat('pt-BR', { style: 'currency',
  currency: 'BRL' })`, componente `<MoneyInput>` para entrada (aceita
  vírgula decimal, formata em tempo real). Backend usa `decimal` — nunca
  `parseFloat` ingênuo que perde precisão; usar biblioteca decimal
  (`decimal.js` ou `big.js`) para qualquer cálculo no cliente (ex.: preview
  de margem antes de salvar).
- Quantidades de estoque: até 3 casas decimais quando o produto permite
  fracionamento (`Unidade.PermiteFracionar`), senão inteiro — a máscara do
  campo de quantidade se adapta à unidade selecionada.
- Enums: o backend serializa enums **como string** (`JsonStringEnumConverter`,
  `agents.md` §13) — os `<Select>` do frontend usam exatamente os literais
  gerados pelo `openapi-typescript` (ex.: `"Cif" | "Fob"` para `TipoFrete`,
  `"Principal" | "Reserva" | "Terceiros"` para `TipoDeposito`). Rótulo
  amigável (`Cif` → "CIF — frete por conta do remetente") fica em um mapa
  de tradução por enum em `compartilhado/utils/rotulosEnum.ts`, nunca
  hardcoded dentro do componente de tela.

## 3.9 Paginação, filtros e tabelas

- Todo `DataTable` genérico (ver `05-fase-1-cross-cutting.md` §5.3) espera
  `PagedResult<T>` e expõe `paginaAtual`/`tamanhoPagina` sincronizados com a
  query string da URL (`?pagina=2&tamanhoPagina=20`) — permite
  compartilhar/voltar sem perder o filtro, e reflete literalmente
  `ParametrosPaginacao` do backend (1-based, padrão 20, máximo 100).
- Filtro textual (`termoBusca`) sempre com `debounce` de 400ms antes de
  disparar a query — nunca uma requisição por tecla.
- Toda lista tem estado vazio (`EmptyState`) diferenciado para "nenhum
  registro cadastrado" vs. "nenhum resultado para este filtro" (mensagens
  diferentes, a segunda com ação "Limpar filtros").
- Colunas de auditoria (`CriadoEm`/`CriadoPor`, `AlteradoEm`/`AlteradoPor` —
  quando o DTO expuser) nunca aparecem na lista por padrão; ficam num
  painel "Detalhes de auditoria" recolhido no Detalhe, coerente com o
  backend tratar isso como metadado técnico, não dado de negócio principal
  (`agents.md` §10).

## 3.10 Segurança: o frontend nunca é a única barreira

Reforçando §3.6: toda regra de permissão, toda regra de negócio (limite de
crédito, bloqueio, FEFO, unicidade) é **imposta pelo backend**. O frontend
replica validação e visibilidade **apenas por UX** (feedback rápido, menos
cliques em vão) — nunca deve existir uma tela que assuma que "se o botão não
aparece, a ação é impossível" como única proteção. Qualquer tentativa de
contornar isso deve continuar batendo em 401/403/422 no backend.

## 3.11 Checklist obrigatório para toda nova tela

Espelhando o checklist do backend (`agents.md` §16), adaptado ao frontend:

1. Endpoint(s) da API já existem e foram conferidos no Controller real
   (rota, verbo, política de autorização, formato de request/response) —
   nunca supor o contrato.
2. Tipos gerados (`api.gerado.ts`) estão atualizados para o endpoint em
   questão (rodar `npm run gerar-tipos` se o backend mudou).
3. Funções de `api.ts` do módulo criadas/atualizadas.
4. Hooks de dados (`useListarX`/`useX`/`useCriarX`...) usando TanStack
   Query, com chave de cache consistente (`['produtos', 'lista', filtros]`).
5. Schema Zod criado/atualizado espelhando o Validator do backend (§3.4).
6. Página(s) montada(s) sobre os componentes genéricos de
   `compartilhado/ui/` (nunca recriar tabela/formulário do zero).
7. Toda ação sensível envolvida em `<RequerPermissao>` com a chave correta.
8. Erros tratados via `useMutacaoComErro` (§3.5) — nenhum `try/catch` cru.
9. Datas convertidas via `<DatePickerBr>`/`<DataHora>` (§3.7); dinheiro via
   `<MoneyInput>` (§3.8).
10. Teste unitário do schema de validação + teste de componente da tela
    (pelo menos: renderiza lista vazia, renderiza lista com dados, submit
    de formulário válido chama a API correta).
11. Item adicionado ao menu (`app/layout`) com a chave de permissão
    correspondente, e à rota com o guard correto (§2.3).
12. Documento de fase correspondente (`04` a `09`) atualizado se o
    comportamento divergiu do especificado (mesma disciplina do backend em
    `.docs/06-decisoes-de-engenharia.md` — toda divergência vira uma
    decisão registrada, nunca fica só na memória de quem implementou).

## 3.12 Testes

- **Unidade**: Vitest para funções puras (formatadores, schemas Zod,
  mapeamento de erro).
- **Componente**: Testing Library para páginas/componentes — sempre
  mockando o cliente HTTP na borda (`msw` — Mock Service Worker — para
  simular as respostas da API, nunca mockando hooks internos), para o
  teste continuar validando a integração real entre componente e chamada
  HTTP.
- **E2E**: Playwright, rodando contra uma API real de teste (mesmo espírito
  do backend proibir InMemory/SQLite em testes de integração — `agents.md`
  §18 — o frontend não deve validar fluxos críticos só com mocks). Fluxos
  cobertos no MVP: login completo (senha + TOTP), CRUD de Produto, CRUD de
  Cliente, movimentação de estoque (entrada → posição → kardex).
- Sem teste de infraestrutura de terceiro (não testar se o Ant Design
  renderiza corretamente — isso é responsabilidade da biblioteca).

## 3.13 Acessibilidade e responsividade

- Navegação por teclado funcional em todo formulário (ordem de tab lógica,
  Ant Design já entrega isso por padrão — não quebrar com CSS custom).
- Contraste mínimo AA em texto sobre fundo (tema customizado do antd
  validado com ferramenta de contraste antes de fixar a paleta de marca).
- Responsivo até tablet (768px) nas telas de consulta/leitura (Posição de
  Estoque, Kardex) — formulários densos (Produto, Cliente) são otimizados
  para desktop (≥1024px) e apenas utilizáveis (não otimizados) abaixo
  disso, coerente com o perfil de uso interno descrito em `01` §1.3.
