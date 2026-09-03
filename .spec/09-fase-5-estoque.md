---
título: Fase 5 — Estoque (Livro-razão / Kardex v0)
versão do documento: 1.0
data: 2026-09-02
espelha: .docs/12-fase-5-estoque-v0.md (backend)
endpoints reais: EstoqueController, DepositosController
---

# 09 — Fase 5: Estoque (Livro-razão / Kardex v0)

## 9.1 Objetivo da fase

Telas de movimentação e consulta sobre o livro-razão de estoque que o
backend entregou na Fase 5 (v0): `MovimentoEstoque` append-only + projeção
`SaldoEstoque`. É a fase com a lógica de UX mais "operacional" do MVP —
usada por quem fisicamente mexe em mercadoria no depósito, então clareza
imediata (o que aconteceu, com qual saldo resultante) importa mais que
densidade de campos.

**Importante (escopo v0, `.docs/12` backend)**: esta fase **não inclui**
transferência entre depósitos, inventário cíclico nem endereçamento físico
(rua/bloco/nível) — ficam para o `PR 5b` do backend, e o frontend
correspondente entra como fase futura em `10-fases-futuras-backlog.md`
quando o backend entregar. Não construir essas telas agora especulando o
contrato.

## 9.2 Depósitos (`/estoque/depositos`)

Permissão: `Estoque.GerenciarDepositos` (escrita); `Estoque.Consultar`
(leitura).

- **Lista** (`GET /estoque/depositos?incluirInativos=`, sem paginação):
  Nome, Código, Tipo (`<Tag>` com rótulo do enum `TipoDeposito`: Principal
  / Reserva / Terceiros), Padrão (ícone destacado), Status.
- **Formulário** (`POST`/`PUT /estoque/depositos/{id}`): Nome*, Código*
  (único, validado — 409 tratado, `03` §3.5), Tipo (`<Select>` enum).
- Ação **Definir como padrão** (`POST /estoque/depositos/{id}/definir-
  padrao`) — o backend remove a marca de padrão de todos os outros
  automaticamente (`RemoverPadraoDosOutrosAsync`); a UI só precisa
  recarregar a lista após a chamada, nunca gerenciar isso manualmente no
  cliente.
- Ações Inativar/Reativar via `ConfirmDialog`.
- **Nota operacional crítica para o roteiro de homologação** (`.docs/06`
  D-36): o backend **não semeia nenhum depósito** — a primeira ação de
  qualquer ambiente novo é cadastrar o "Depósito Principal" aqui. A tela
  de Depósitos deve ser a primeira coisa configurada em qualquer ambiente
  novo, e vale um `EmptyState` (`03` §3.9) explícito nesta tela orientando
  isso: "Nenhum depósito cadastrado. Cadastre o depósito principal para
  começar a movimentar estoque." com o botão de criação já em foco.

## 9.3 Movimentações — três formulários de lançamento

Todos em `/estoque/entrada`, `/estoque/saida`, `/estoque/ajuste`
(permissões `Estoque.MovimentarEntrada`, `Estoque.MovimentarSaida`,
`Estoque.Ajustar` respectivamente) — formulários curtos e focados, não
telas de "cadastro", pensados para uso repetitivo rápido no balcão do
depósito.

### 9.3.1 Entrada avulsa (`POST /estoque/entradas`)

Campos: Depósito (opcional — se vazio, backend usa o depósito padrão;
`<Select>` pré-selecionado com o padrão quando existir), Produto*
(`SelectAutocomplete`), Lote (só exibido/habilitado se `Produto.
ControlaLote`), Validade (`<DatePickerBr>`, idem), Quantidade*, Custo
unitário (opcional), Observação. Nota de contexto (texto de ajuda fixo na
tela): "Entrada sem documento fiscal — para entrada com nota fiscal e
cálculo de custo médio, aguarde a Fase 7 (Compras)." — deixa explícito o
limite do v0 para o usuário, evitando confusão (`.docs/06` D-34).

### 9.3.2 Saída avulsa (`POST /estoque/saidas`)

Campos: Depósito, Produto*, Lote (**opcional mesmo para produto com
controle de lote** — se vazio, o backend aplica **FEFO** automaticamente,
consumindo o(s) lote(s) mais próximo(s) do vencimento primeiro, podendo
gerar múltiplos movimentos), Quantidade*, Observação. A tela exibe um
aviso permanente quando o campo Lote é deixado vazio para produto com
controle de lote: "Sem lote informado, a saída seguirá FEFO (vencimento
mais próximo primeiro)." Resposta é uma **lista de IDs de movimento**
(pode ser mais de um) — após salvar, a tela mostra quantos movimentos
foram gerados e link para ver no Kardex.

### 9.3.3 Ajuste (`POST /estoque/ajustes`)

Campos: Depósito, Produto*, Lote, Validade (se Entrada), Sentido*
(`<Radio>` Entrada/Saída), Quantidade*, Motivo* (`<Select>` enum
`MotivoAjuste`: Perda / Quebra / Vencimento / Achado / Correção de
inventário / Outro), Observação. Sentido Saída aplica FEFO igual à saída
avulsa (mesmo aviso do §9.3.2, condicional a `Sentido === 'Saida'`).

### 9.3.4 Regra comum às três telas

Nenhuma das três permite saldo negativo (regra do backend,
`SaldoEstoque.Debitar` recusa — `.docs/06` D-34) — se o usuário tentar
uma saída/ajuste maior que o saldo disponível, o erro 422 do backend é
exibido com a mensagem específica do backend (nunca uma mensagem genérica
inventada no frontend — `03` §3.5).

## 9.4 Posição de Estoque (`/estoque/posicao`)

Permissão: `Estoque.Consultar`.

`GET /estoque/posicao` (paginado, `PosicaoEstoqueDto`): tela de consulta
consolidada — uma linha por combinação Produto × Depósito. Colunas:
Produto, Depósito, Quantidade total, Estoque mínimo, Estoque máximo,
indicador visual "Abaixo do mínimo" (`<Tag>` vermelho quando
`AbaixoDoMinimo=true`). Filtros: Depósito, Produto, **"Apenas abaixo do
mínimo"** (switch — mapeia direto para `ApenasAbaixoDoMinimo` do filtro do
backend, útil como painel de reposição rápida), busca textual.

Clique numa linha abre `GET /estoque/posicao/{produtoId}?depositoId=`
(`PosicaoProdutoDepositoDto`) em um drawer/modal — **detalhamento por
lote**: lista de `SaldoLoteDto` (Lote, Validade, Quantidade), ordenada por
validade (mais próximo primeiro, reforçando visualmente a lógica FEFO que
rege as saídas).

## 9.5 Kardex (`/estoque/kardex`)

Permissão: `Estoque.Consultar`.

`GET /estoque/kardex` (paginado, `MovimentoEstoqueDto`) — o **livro-razão**
em si: filtros obrigatórios Produto* e período (De/Até, `<DatePickerBr>`
range), opcional Depósito. Colunas, na ordem em que aparecem no DTO
(refletindo a leitura natural de um kardex): Data/hora do movimento
(`<DataHora>`), Sentido (`<Tag>` Entrada verde / Saída vermelho), Origem
(`<Tag>`: Avulso / Ajuste — só esses dois existem no v0, `OrigemMovimentoEstoque`
— os demais valores do enum, Inventário/Pedido/Entrada/Transferência, ficam
prontos no `rotulosEnum` mas só aparecerão quando as fases correspondentes
existirem), Motivo do ajuste (só preenchido quando Origem=Ajuste), Depósito,
Lote, Validade, Quantidade, **Saldo após** (destacado — é o valor que dá
sentido a um kardex, mostrar em negrito/coluna fixa), Custo unitário,
Observação, Usuário.

Este é o relatório mais "denso" do MVP — usar tabela com scroll horizontal
se necessário (`03` §3.13) em vez de esconder colunas, já que o usuário de
kardex tipicamente precisa ver a linha inteira para auditoria.

## 9.6 Lotes a Vencer (`/estoque/lotes-a-vencer`)

Permissão: `Estoque.Consultar`.

`GET /estoque/lotes-a-vencer?dias=&depositoId=` (`LoteAVencerDto`, lista
simples sem paginação). Parâmetro `dias` com padrão 90 (mesmo default do
backend quando `dias<=0`) — a tela expõe um seletor rápido (30/60/90/180
dias) em vez de um input numérico livre, mais rápido para o uso diário.
Colunas: Produto, Depósito, Lote, Validade, Quantidade, **Dias para
vencer** (`<Tag>` colorida por faixa: vermelho ≤7 dias, laranja ≤30,
amarelo ≤90, neutro acima — mesma lógica de semáforo comum em ERPs
farmacêuticos, dado o peso regulatório de produto vencido no setor,
`.spec/10`). Esta tela é boa candidata a também aparecer como **widget no
painel inicial** (`/`, criado como placeholder na Fase 0) assim que o
painel real for especificado — não faz parte do escopo desta fase, mas
registrar a intenção aqui evita retrabalho de contrato de API futuro.

## 9.7 Critério de pronto (Fase 5)

- CRUD de Depósitos com ação "definir padrão" funcional.
- Três formulários de movimentação (entrada/saída/ajuste) funcionais
  contra a API real, com aviso de FEFO exibido corretamente.
- Posição de Estoque com filtro "abaixo do mínimo" e drill-down por lote.
- Kardex funcional com filtro de produto/período obrigatório.
- Lotes a Vencer com seletor rápido de janela de dias e semáforo visual.
- Teste E2E (Playwright) do fluxo: cadastrar depósito → entrada de produto
  → conferir na Posição → conferir no Kardex (fluxo ponta a ponta citado
  em `03` §3.12).
