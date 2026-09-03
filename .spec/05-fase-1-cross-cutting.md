---
título: Fase 1 — Cross-cutting / Plumbing do Frontend
versão do documento: 1.0
data: 2026-09-02
espelha: .docs/07-fase-1-cross-cutting.md (backend)
---

# 05 — Fase 1: Cross-cutting / Plumbing

## 5.1 Objetivo da fase

Construir toda a "cola" reutilizável que as telas de negócio (Fases 2 em
diante) vão usar — exatamente como a Fase 1 do backend entregou behaviors,
auditoria e middlewares antes de qualquer entidade real existir
(`.docs/07` backend). Sem esta fase, cada tela reinventaria paginação,
tratamento de erro e formulário do zero — o que o checklist de `03` §3.11
proíbe.

## 5.2 Cliente HTTP e sessão

- `compartilhado/api/clienteHttp.ts`: instância Axios única (ver
  `02-arquitetura-e-estrutura.md` §2.4) com os dois interceptors (injeção de
  Bearer token, renovação automática em 401).
- `compartilhado/auth/sessaoStore.ts` (Zustand): guarda `accessToken` (em
  memória, nunca em `localStorage` — ver `12-decisoes-de-engenharia.md`
  D-05 para a justificativa), `refreshToken` (persistido, ver D-05),
  `MeuPerfilDto` (id, nome, login, email, empresa/filial, perfis,
  permissões) e o estado derivado `autenticado: boolean`.
- Ao carregar a aplicação, se existir `refreshToken` salvo, tenta renovar
  silenciosamente (`POST /autenticacao/token/renovar`) antes de decidir se
  mostra a tela de login ou o app — evita pedir login a cada F5.
- Fila de requisições durante renovação: se duas chamadas disparam 401 ao
  mesmo tempo, só a primeira dispara `token/renovar`; as demais aguardam o
  resultado e reusam o novo token (nunca duas renovações concorrentes —
  cuidado explícito porque o backend detecta **reuso de refresh token**
  como sinal de comprometimento e revoga a sessão, `agents.md` §14.1).

## 5.3 `DataTable` genérico

Componente único (`compartilhado/ui/DataTable.tsx`) usado por toda tela de
lista (§3.2). Contrato:

```ts
type DataTableProps<T> = {
  colunas: ColumnsType<T>;
  usarConsulta: (filtros: F, paginacao: ParametrosPaginacao) =>
    UseQueryResult<PagedResult<T>>;
  filtros: React.ReactNode;         // barra de filtros específica da tela
  aoClicarLinha?: (registro: T) => void;
  acaoPrincipal?: { rotulo: string; permissao: string; aoClicar: () => void };
};
```

Encapsula: sincronização de página/tamanho com a URL (§3.9), loading
skeleton do Ant Design (`<Table loading>`), estado vazio (`EmptyState` —
diferenciando "sem registros" de "sem resultado para o filtro", §3.9), e
exibição de `totalRegistros`/`totalPaginas` no rodapé — todos os campos que
`PagedResult<T>` já devolve.

## 5.4 `FormPage` e componentes de campo

- `compartilhado/ui/FormPage.tsx`: casca de página de formulário —
  cabeçalho com título e breadcrumb, `<Tabs>` opcional (§3.3), rodapé fixo
  com Salvar/Cancelar, integração com React Hook Form (`useForm` +
  `zodResolver`).
- `compartilhado/ui/MoneyInput.tsx`: input mascarado de moeda BRL (§3.8).
- `compartilhado/ui/DatePickerBr.tsx` / `DataHora.tsx`: conversão UTC↔local
  (§3.7).
- `compartilhado/ui/SelectAutocomplete.tsx`: select com busca assíncrona
  paginada, usado para toda referência a outra entidade (ex.: selecionar
  Cidade num endereço, selecionar Grupo/Marca num Produto, selecionar
  Cliente numa tela futura de Pedido). Debounce de 400ms (§3.9), sempre
  busca no backend (nunca carrega lista inteira no cliente — cidades, por
  exemplo, são milhares de registros).
- `compartilhado/ui/ConfirmDialog.tsx`: modal de confirmação padronizado
  para toda ação destrutiva/irreversível-na-prática (`bloquear`, `inativar`,
  ajuste de estoque) — sempre exige um motivo em texto quando o endpoint
  correspondente do backend também exige (ex.: `BloquearClienteCommand`
  recebe `Motivo`).

## 5.5 Tratamento global de erro (fino)

- `useMutacaoComErro`: wrapper sobre `useMutation` do TanStack Query que
  aplica o mapeamento de `03-padroes-de-engenharia-e-ui.md` §3.5
  automaticamente — toda tela de formulário usa este hook em vez de
  `useMutation` cru.
- Sistema de notificação (`antd` `notification`/`message`) padronizado:
  toasts de sucesso ("Produto salvo com sucesso") e erro (mensagem do
  backend), com duração e posição consistentes em toda a aplicação —
  definidos uma vez em `compartilhado/ui/notificacoes.ts`.
- Página "Acesso negado" (403) e "Não encontrado" (404) genéricas,
  reusadas por qualquer módulo.

## 5.6 RBAC (esqueleto de hooks — telas reais entram na Fase 2/3)

- `usePermissao()` e `<RequerPermissao>` (§3.6) implementados nesta fase,
  ainda **sem dado real** (mock local até a Fase 2 existir login de
  verdade) — permite que as Fases 2+ já sejam construídas usando o padrão
  final desde o primeiro componente, evitando retrabalho.
- `compartilhado/auth/permissoes.ts`: lista de constantes de chave de
  permissão, populada a partir de `GET /api/permissoes` (a chamada real só
  acontece na Fase 2, quando o login existe — nesta fase o arquivo é
  criado com a lista conhecida hoje via `PermissoesConhecidas` do backend,
  como valor inicial documentado).

## 5.7 Hooks utilitários

- `usePaginacao()`: lê/escreve `pagina`/`tamanhoPagina` da query string.
- `useFiltrosDeUrl<T>()`: idem para filtros de tela (mantém filtro ao
  navegar e voltar).
- `useDebounce<T>(valor, ms)`: usado pelo `SelectAutocomplete` e por
  qualquer campo de busca textual.

## 5.8 Critério de pronto (Fase 1)

- `DataTable`, `FormPage`, `MoneyInput`, `DatePickerBr`, `SelectAutocomplete`
  e `ConfirmDialog` existem, documentados com Storybook-like exemplos
  (arquivo `.stories.tsx` ou página de showcase interna) e cobertos por
  teste de componente.
- `useMutacaoComErro` testado com os 7 casos de status HTTP de `03` §3.5
  (400/401/403/404/409/422/500).
- Renovação de token testada (incluindo o caso de fila de requisições
  simultâneas, §5.2).
- Nenhuma tela de negócio criada ainda — esta fase é 100% infraestrutura
  reutilizável, assim como a Fase 1 do backend não continha regra de
  negócio (`.docs/07` backend, nota inicial).
