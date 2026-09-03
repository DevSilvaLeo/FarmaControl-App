---
título: UI Kit — Inventário de Componentes de `compartilhado/ui/`
versão do documento: 1.0
data: 2026-09-02
status: normativo — expande `.spec/05-fase-1-cross-cutting.md` §5.3/§5.4 e
        `agents.md` §5 (divisão de responsabilidade Tailwind vs Ant Design v6)
---

# 04 — UI Kit

## 4.1 Regra de divisão Tailwind × Ant Design v6

`agents.md` §5. A dúvida "Tailwind ou antd?" se resolve por esta tabela, não
caso a caso:

| Responsabilidade | Camada |
|---|---|
| Layout (`flex`/`grid`/`gap`), espaçamento, tipografia, cor de marca, responsividade/breakpoints | **Tailwind 3** |
| Componente simples específico do projeto (`PageHeader`, `EmptyState`, `KpiCard`, `StatusTag`, `SemaforoValidade`, `BottomActionBar`, `Marca`) | **Tailwind 3** (composto, sem reconstruir nada do antd) |
| Componente complexo/interativo (`Table`, `Form`/`Input`/`Select`/`DatePicker`, `Tabs`/`Steps`, `Modal`/`Drawer`, `Upload`, `Affix`, `Transfer`, `Checkbox.Group`) | **Ant Design v6** |
| Wrappers do projeto sobre o antd (`DataTable`, `FormPage`, `MoneyInput`, `DatePickerBr`, `SelectAutocomplete`, `ConfirmDialog`, `CampoCep`) | **antd por dentro, Tailwind no layout ao redor** |

Nenhuma tela reconstrói em Tailwind puro um componente que o antd já resolve
bem (`.spec/12` D-02).

## 4.2 Componentes próprios (Tailwind)

### `PageHeader`
Título `h1` + breadcrumb + slot de ações à direita (`lg:`) / abaixo (mobile).
Props: `titulo`, `breadcrumb?`, `acoes?: ReactNode`, `voltarPara?: string`.

### `SectionCard`
Card branco `rounded-lg` `shadow-sm` `border`, com `h2` opcional e padding
responsivo (`16px` → `24px`). Agrupa campos dentro de uma aba.

### `StatusTag`
`<Tag>` do antd estilizada pelos tokens semânticos (`01` §1.4). Variantes:
`ativo` (verde), `inativo` (neutro), `bloqueado` (erro), `padrao` (primária,
com ícone), `sistema` (acento). Sempre com texto, nunca só cor.

### `SemaforoValidade`
`<Tag>` que recebe `dias: number` (ou `validadeUtc: string`) e resolve a
faixa/cor por `01` §1.5. Renderiza sempre o texto ("faltam 12 dias" /
"venceu há 3 dias"). Usado em Lotes a Vencer, validade de alvará, registro MS.

### `KpiCard`
Card de indicador para o Painel: rótulo (`label`), valor (`display`),
delta/So opcional, ícone, cor de realce por severidade. Clicável (navega para
a lista filtrada). Mobile: empilha; `lg:`: grid de 3–4.

### `BottomActionBar`
Barra fixa no rodapé da viewport para mobile (`position: sticky/fixed`,
`shadow-md` para cima, `safe-area-inset-bottom`, alvo ≥ 44px). No `lg:` não
renderiza — dá lugar ao `Affix` no rodapé do card do `FormPage`.

### `EmptyState`
Ilustração leve (SVG inline monocromático `neutral/300`) + título + descrição
+ slot de ação. Dois presets: `semRegistros` e `semResultado` (com
`[Limpar filtros]`) — `.spec/03` §3.9.

### `LinhaDoTempoDeStatus` *(antecipado — sem uso no MVP)*
Lista vertical de `{ status, usuario, dataHoraUtc, observacao? }` renderizada
com `<Steps>`/timeline do antd. Construído já na Etapa 1 porque Pedido (Fase
6) e OS (Fase 8+) precisam do mesmo padrão — recomendação de `.spec/10`
§10.2. Sem rota que o use ainda; entra no showcase `/estilo`.

### `Marca`
Wordmark + símbolo provisórios (`01` §1.8). Ponto único de troca quando o
logo oficial chegar.

### `DetailPage` — `.docs/03` §3.4 *(Etapa 2)*
Casca de página de Detalhe. `< lg`: cabeçalho + ações em `⋯` (action sheet) +
chips de seção roláveis. `lg:`: barra de ações visível + `<Tabs>`. Cada ação
respeita sua `permissao` (`usePermissao`); painel "Detalhes de auditoria"
colapsado ao pé.

### `GridEmbutido<T>` — `.docs/03` §3.5 *(Etapa 2)*
Grid embutido editável. `< lg`: cards editáveis (um card = uma linha) +
`[+ Adicionar]` largura total. `lg:`: tabela editável. `aoMudar` recebe a
lista inteira (a tela salva via `PUT` de substituição total). `confirmarAoRemover`
liga um `ConfirmDialog` antes de excluir linha persistida.

## 4.3 Wrappers sobre Ant Design

### `DataTable<T>` — `.spec/05` §5.3
Contrato (inalterado da spec):
```ts
type DataTableProps<T> = {
  colunas: ColumnsType<T>;
  usarConsulta: (filtros, paginacao) => UseQueryResult<PagedResult<T>>;
  filtros: React.ReactNode;
  aoClicarLinha?: (registro: T) => void;
  acaoPrincipal?: { rotulo: string; permissao: string; aoClicar: () => void };
  colunasMobile?: (keyof T)[];   // NOVO: 3–4 campos p/ o card mobile
  renderCardMobile?: (registro: T) => React.ReactNode; // NOVO: override total do card
};
```
Comportamento responsivo (`03-blueprints-responsivos.md` §3.2):
- **< `md:`**: renderiza **lista de cards** (não `<Table>`), montada a partir
  de `colunasMobile`/`renderCardMobile`; filtros em bottom sheet; busca sempre
  visível; paginação compacta.
- **`md:`**: `<Table>` com subconjunto de colunas.
- **`lg:`+**: `<Table>` completa, ações inline, filtros em barra acima.
- Sincroniza `pagina`/`tamanhoPagina` e filtros com a query string (`usePaginacao`,
  `useFiltrosDeUrl` — `.spec/05` §5.7).
- `loading` = skeleton do antd. `EmptyState` diferenciado.

### `FormPage` — `.spec/05` §5.4
Casca de formulário: `PageHeader` + `<Tabs>` opcional (§3.3) + rodapé de ações.
Responsivo:
- **< `md:`**: abas → `<Steps>`/fluxo em etapas (ou `<Select>` de seção para
  2–3 abas); `BottomActionBar` fixa; indicador de passo com marcador de erro.
- **`md:`**: `<Tabs>` roláveis, coluna única, ações fixas no rodapé do card.
- **`lg:`+**: `<Tabs>` completas, grid 2–3 colunas por aba, `Affix` de
  `Salvar`/`Cancelar`.
Integra React Hook Form + `zodResolver`; expõe helper para mapear erro 400 do
backend em `setError` por campo (`.spec/03` §3.5).

### `MoneyInput` — `.spec/03` §3.8
Input mascarado BRL: aceita vírgula decimal, formata em tempo real, emite
`number`/`string decimal`. Cálculo de preview (margem) usa `decimal.js`
(`.spec/12` D-09). Alinhado à direita, `tabular-nums`.

### `DatePickerBr` / `DataHora` — `.spec/03` §3.7
`DatePickerBr`: `<DatePicker>` do antd com `format="dd/MM/yyyy"`, converte
UTC↔`America/Sao_Paulo` na borda. `DataHora`: componente de **exibição**
(`dd/MM/yyyy HH:mm`) para Kardex/auditoria. Proibido formatar data à mão em
tela (`.spec/12` D-08).

### `SelectAutocomplete` — `.spec/05` §5.4
Select com busca assíncrona paginada (debounce 400ms), **sempre** busca no
backend, nunca carrega lista inteira. Usado em toda referência a outra
entidade (Cidade, Grupo/Marca, Fornecedor, Cliente, Usuário…). Suporta
`dependeDe` (ex.: Subgrupo depende de Grupo — limpa seleção se o pai mudar,
`.spec/07` §7.3.2). Mobile: abre em drawer/fullscreen com campo de busca no
topo.

### `ConfirmDialog` — `.spec/05` §5.4
Modal padronizado para ação destrutiva/irreversível-na-prática. Campo de
**motivo obrigatório** quando o endpoint do backend exige (ex.:
`BloquearClienteCommand.Motivo`, `RegistrarDebitoVendedorCommand.Motivo`).
Botão de confirmação na cor semântica da ação (erro para inativar/bloquear).

### `CampoCep` — `.spec/07` §7.2
Ao perder foco com 8 dígitos válidos, consulta `GET /geografia/ceps/{numero}`
e preenche logradouro/bairro/cidade/UF; usuário confirma número/complemento.
Estados: ocioso, consultando (spinner no sufixo), preenchido, "CEP não
encontrado" (permite preencher à mão + link "cadastrar CEP" para quem tem
`CadastrosApoio.Gerenciar`).

### `FiltrosResponsivos` — `.docs/03` §3.2 *(Etapa 2)*
Adapta a barra de filtros: `< md` esconde os controles atrás de um botão
"Filtros" (badge de contagem) que abre um bottom sheet com `[Limpar]`/
`[Aplicar]`; `md:+` renderiza os controles inline. Usado internamente pelo
`DataTable` (quando recebe `filtros`) e disponível avulso.

### `useBreakpoint` (hook) — `agents.md` §4.1 *(Etapa 2)*
`compartilhado/hooks/useBreakpoint.ts`: `{ sm, md, lg, xl, ehMobile, ehTablet,
ehDesktop }` a partir de `matchMedia`, com os **valores do Tailwind**
(sm 640 / md 768 / lg 1024 / xl 1280). Fonte única da decisão responsiva em
JS — os componentes do kit não usam mais `Grid.useBreakpoint` do antd.

## 4.4 Formulário — campos e comportamento

| Regra | Fonte |
|---|---|
| Rótulo acima do campo (não à esquerda) — melhor em mobile e em telas estreitas | UX Sr |
| Campo obrigatório: `*` no rótulo; nunca só placeholder | a11y |
| Erro: borda `corErro` + ícone + texto abaixo; some ao corrigir | `.spec/03` §3.5 |
| Texto de ajuda: `caption`, abaixo do campo, sempre visível (não tooltip) para regra de negócio importante (ex.: aviso FEFO, "aguarde Fase 7") | `.spec/09` §9.3 |
| Switch para booleano; `<Radio>` quando a escolha muda o formulário (Tipo de pessoa) | `.spec/07` §7.5.2 |
| Enum → `<Select>` com rótulo amigável de `rotulosEnum.ts`, nunca o literal cru | `.spec/03` §3.8 |
| Campo dependente aparece/desaparece (disclosure), não fica `disabled` sem explicação | `.spec/03` §3.6 espírito |
| Códigos (barras, lote, NCM) em `mono` + `tabular-nums` | `02` §2.3 |

## 4.5 Notificações — `.spec/05` §5.5

`compartilhado/ui/notificacoes.ts` centraliza (um lugar só):
- **Sucesso**: `message.success`, topo-direito, 3s, texto curto ("Produto
  salvo").
- **Erro de negócio (409/422)**: `notification.error`, topo-direito, 6s,
  **mensagem do backend verbatim** (nunca genérico — `.spec/03` §3.5).
- **Erro 500**: `notification.error` genérico "Ocorreu um erro inesperado.
  Tente novamente."
- **Erro 400**: **não** vira toast — marca campo a campo no formulário.

## 4.6 Ícones

- Base: `@ant-design/icons`.
- Ícones de domínio (um set pequeno, SVG inline em `compartilhado/ui/icones/`):
  `lote`, `validade`, `controlado` (produto controlado/SNGPC), `receita`,
  `deposito`, `entrada`, `saida`, `ajuste`, `licitacao`.
- Tamanho padrão `16px` em texto, `20px` em botão-ícone, `24px` no bottom nav.
- Ícone **nunca** é o único portador de significado numa ação — sempre tem
  `aria-label` e, em desktop, tooltip.

## 4.7 Showcase interno `/estilo` — `.spec/05` §5.8

Rota privada (atrás de login, mas sem permissão específica) que documenta cada
token e cada componente do kit, renderizado em **375 / 768 / 1280** lado a
lado quando possível. Serve de referência viva e de alvo para os testes de
componente (`.spec/03` §3.12). Não vai para produção com item de menu — acesso
por URL direta / link no rodapé do Diagnóstico.
