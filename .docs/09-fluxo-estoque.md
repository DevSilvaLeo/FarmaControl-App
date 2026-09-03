---
título: Fluxo de UX — Estoque e Painel Inicial (Etapas 6 e 7)
versão do documento: 1.0
data: 2026-09-02
espelha: .spec/09-fase-5-estoque.md (contrato de API é lá; aqui é UX/layout)
---

# 09 — Fluxo de UX: Estoque e Painel

A fase com a UX mais **operacional** do MVP: usada por quem mexe fisicamente
em mercadoria. Clareza imediata do que aconteceu e do saldo resultante importa
mais que densidade de campos (`.spec/09` §9.1).

**Escopo v0** (`.spec/09` §9.1): sem transferência entre depósitos, sem
inventário cíclico, sem endereçamento físico — não construir essas telas
especulando contrato.

## 9.1 Depósitos (`/estoque/depositos`)

Permissões: `Estoque.GerenciarDepositos` (escrita), `Estoque.Consultar`
(leitura).

**Lista** (sem paginação): Nome, Código (`mono`), Tipo (`StatusTag` com
rótulo do enum `TipoDeposito`: Principal / Reserva / Terceiros), Padrão
(`StatusTag` variante `padrao`, com ícone), `StatusTag` de status.

**`EmptyState` crítico** (`.spec/09` §9.2 / `.docs/03` §3.8): quando não há
nenhum depósito — "Nenhum depósito cadastrado. Cadastre o depósito principal
para começar a movimentar estoque." com `[+ Novo depósito]` **em foco**. Essa
é a primeira configuração de qualquer ambiente novo (o backend não semeia
depósito).

**Formulário:** Nome*, Código* (`mono`, único — 409 tratado: "Este código já
está em uso."), Tipo (`<Select>` enum). Curto, sem abas.

**Ações:** "Definir como padrão" (`POST .../definir-padrao` — o backend
remove o padrão dos outros; a UI só recarrega a lista). Inativar / Reativar
via `ConfirmDialog`.

## 9.2 Movimentações — entrada / saída / ajuste

Três formulários **curtos e focados**, pensados para uso repetitivo rápido no
balcão do depósito (`.spec/09` §9.3). Não são "cadastros". Rotas
`/estoque/entrada`, `/estoque/saida`, `/estoque/ajuste`.

### 9.2.1 Padrão comum das três telas

- Layout de **coluna única** em qualquer largura (formulário curto) —
  `max-width: 520px` no desktop. **Alvos de toque grandes** (≥ 44px), campos
  espaçados — o operador pode estar de luva, com o celular numa mão.
- **Produto** (`SelectAutocomplete`) é o campo dominante — primeiro,
  destacado, autofoco.
- **Depósito**: `<Select>` pré-selecionado com o depósito **padrão** quando
  existir; se vazio, o backend usa o padrão (`.spec/09` §9.3.1).
- **Lote / Validade**: só aparecem/habilitam conforme a regra da tela (ver
  cada uma). Disclosure, não `disabled` mudo.
- Botão primário grande no rodapé (`BottomActionBar` no mobile). Após salvar:
  **toast de sucesso + o formulário se auto-limpa para o próximo lançamento**
  (mantém Depósito selecionado), com um link "ver no Kardex".
- **Saldo negativo é recusado pelo backend** (`.spec/09` §9.3.4): o 422 é
  exibido com a mensagem do backend verbatim — nunca uma mensagem genérica
  inventada.

### 9.2.2 Entrada avulsa

Campos: Depósito, Produto*, Lote (só se `Produto.ControlaLote`), Validade
(`DatePickerBr`, idem), Quantidade*, Custo unitário (opcional), Observação.

`<Alert type="info">` fixo no topo (`.spec/09` §9.3.1): "Entrada sem
documento fiscal. Para entrada com nota fiscal e cálculo de custo médio,
aguarde a Fase 7 (Compras)."

### 9.2.3 Saída avulsa

Campos: Depósito, Produto*, Lote (**opcional mesmo com controle de lote**),
Quantidade*, Observação.

**Aviso FEFO** (`.spec/09` §9.3.2): quando Lote está vazio para produto com
controle de lote, mostrar um `<Alert type="warning">` permanente: "Sem lote
informado, a saída seguirá FEFO — vencimento mais próximo primeiro."

**Resposta = lista de IDs de movimento** (pode ser mais de um): após salvar,
o toast diz "Saída registrada — N movimento(s) gerado(s)" com link ao Kardex.

### 9.2.4 Ajuste

Campos: Depósito, Produto*, **Sentido*** (`<Radio>` Entrada / Saída), Lote,
Validade (só se Sentido = Entrada), Quantidade*, **Motivo*** (`<Select>` enum
`MotivoAjuste`: Perda / Quebra / Vencimento / Achado / Correção de inventário
/ Outro — rótulos via `rotulosEnum`), Observação.

Aviso FEFO igual ao §9.2.3, **condicional a `Sentido === 'Saida'`**.

## 9.3 Posição de Estoque (`/estoque/posicao`)

Permissão `Estoque.Consultar`. Consulta consolidada — uma linha por
Produto × Depósito.

**Filtros:** Depósito, Produto, **"Apenas abaixo do mínimo"** (switch — mapeia
`ApenasAbaixoDoMinimo`; funciona como painel de reposição rápida), busca
textual.

**Colunas desktop:** Produto, Depósito, Quantidade total (`tabular-nums`, à
direita), Estoque mínimo, Estoque máximo, "Abaixo do mínimo" (`StatusTag`
vermelho quando `AbaixoDoMinimo`).

**Card mobile:** Produto `body-strong` + Depósito `caption`; Quantidade em
destaque; `StatusTag` "Abaixo do mínimo" quando aplicável.

**Drill-down por lote** (`.spec/09` §9.4): toque na linha/card abre um
**drawer** (lateral no `md:+`, de baixo no mobile) com `GET
/estoque/posicao/{produtoId}?depositoId=` — lista de `SaldoLoteDto` (Lote,
Validade, Quantidade) **ordenada por validade** (mais próximo primeiro), cada
linha com `SemaforoValidade` — reforça visualmente a lógica FEFO das saídas.

## 9.4 Kardex (`/estoque/kardex`)

Permissão `Estoque.Consultar`. O **livro-razão** — o relatório mais denso do
MVP.

**Filtros obrigatórios:** Produto* e período (De / Até — `DatePickerBr`
range). Opcional: Depósito. Sem Produto+período → `EmptyState` "Selecione um
produto e um período para consultar o kardex."

**Desktop (`lg:`/`xl:`)** — tabela com **scroll horizontal + colunas fixas**
(`03` §3.7): Produto **sticky à esquerda**; "**Saldo após**" **sticky à
direita** e em `body-strong` — é o número que dá sentido ao kardex (`.spec/09`
§9.5). Ordem das colunas = ordem do DTO: Data/hora (`DataHora`), Sentido
(`StatusTag` Entrada verde / Saída vermelho), Origem (`StatusTag`: Avulso /
Ajuste — só esses no v0; os demais rótulos ficam prontos no `rotulosEnum`),
Motivo do ajuste (só quando Origem = Ajuste), Depósito, Lote (`mono`),
Validade, Quantidade, **Saldo após**, Custo unitário, Observação, Usuário.
**Não esconder colunas** — o auditor precisa da linha inteira.

**Mobile** — um **card por movimento** (`03` §3.7): "Saldo após" é o dado
dominante (tamanho `h3`, `body-strong`); Data/hora + `StatusTag` de Sentido e
Origem no topo; Depósito · Lote · Validade em `caption`; Quantidade e Motivo
na sequência; Usuário ao pé. Filtros num bloco colapsável no topo.

## 9.5 Lotes a Vencer (`/estoque/lotes-a-vencer`)

Permissão `Estoque.Consultar`. Lista simples (sem paginação).

**Seletor de janela:** segmentado **30 / 60 / 90 / 180 dias** (não input
numérico livre — mais rápido no uso diário; default 90 — `.spec/09` §9.6) +
filtro Depósito.

**Colunas / card:** Produto, Depósito, Lote (`mono`), Validade, Quantidade,
**Dias para vencer** → `<SemaforoValidade>` (`01` §1.5: vermelho ≤ 7, laranja
≤ 30, amarelo ≤ 90, neutro acima — sempre com o texto "faltam N dias").

Mobile: card por lote, com o `SemaforoValidade` em destaque.

## 9.6 Painel inicial (`/`) — Etapa 7

O "Painel" placeholder da Etapa 0 vira real assim que Estoque existe. Não faz
parte da Fase 5 do `.spec`, mas `.spec/09` §9.6 registra a intenção de
reaproveitar "Lotes a Vencer" como widget.

**Conteúdo (tudo dirigido por permissão — `.spec/01` §1.4):**
- **Linha de `KpiCard`** (`04` §4.2), cada um clicável para a lista filtrada:
  - "Produtos abaixo do mínimo" → Posição com o filtro ligado
    (`Estoque.Consultar`).
  - "Lotes a vencer em 30 dias" → Lotes a Vencer / janela 30
    (`Estoque.Consultar`).
  - "Clientes bloqueados" → Clientes com filtro de bloqueio
    (`Clientes.Consultar`).
  - (mais KPIs conforme fases futuras: pedidos pendentes, contas a vencer…)
- **Widget "Lotes a Vencer"**: mini-tabela das ~10 validades mais próximas,
  com `SemaforoValidade`, link "ver todos".
- **Ações rápidas** por persona (atalhos): "Nova entrada", "Nova saída",
  "Novo produto", "Novo cliente" — só as que a permissão libera.

**Responsivo:** mobile = pilha vertical (`KpiCard`s, depois widget, depois
ações); `lg:` = grid de 3–4 `KpiCard` + widget em largura dupla + coluna de
ações rápidas.

**Landing por permissão:** se o usuário não tem acesso ao Painel (nenhum KPI
visível), redireciona para o primeiro módulo a que tem acesso. Sem "modo por
persona" — é o mesmo painel, com menos cards.

## 9.7 Checklist de UX das etapas 6–7

- [ ] Depósitos com `EmptyState` de onboarding e ação "definir padrão".
- [ ] Entrada / saída / ajuste operáveis com uma mão em 375px; auto-limpam
      para o próximo lançamento.
- [ ] Aviso FEFO aparece exatamente quando deve (saída/ajuste-saída sem
      lote em produto com controle de lote).
- [ ] Erro 422 de saldo insuficiente mostra a mensagem do backend.
- [ ] Posição com filtro "abaixo do mínimo" e drawer de detalhamento por
      lote em ordem FEFO.
- [ ] Kardex: "Saldo após" sticky/destacado no desktop, dominante no card
      mobile; scroll horizontal contido (o `body` não rola na horizontal).
- [ ] Lotes a Vencer com seletor 30/60/90/180 e semáforo com texto.
- [ ] Painel: KPIs e ações filtrados por permissão; verificado em
      375 / 768 / 1280.

---

## 9.8 Implementação (Etapa 6 — concluída 2026-09-03)

Módulo `modulos/estoque/`, contra o Swagger real. **Alvo da homologação.**

| Tela | Arquivo | Notas |
|---|---|---|
| Depósitos | `paginas/DepositoListaPage.tsx` | lista + modal criar/editar + ações por linha (definir padrão, inativar/reativar); **`EmptyState` de onboarding** ("cadastre o depósito principal") quando a lista está vazia |
| Entrada / Saída / Ajuste | `paginas/MovimentacaoPage.tsx` (param `tipo`) | formulário curto; `SelectProduto` traz `controlaLote` → Lote/Validade condicionais; **banner FEFO** quando saída/ajuste-saída sem lote; auto-limpa para o próximo lançamento (mantém depósito); link "Ver no Kardex" |
| Posição | `paginas/PosicaoPage.tsx` | `DataTable` paginado; filtros Depósito + "apenas abaixo do mínimo"; clique na linha → **drawer com saldo por lote** (ordem de validade) |
| Kardex | `paginas/KardexPage.tsx` | filtros obrigatórios Produto + período (`RangePickerBr`); tabela densa com **"Saldo após" fixo à direita** e Produto fixo à esquerda; `EmptyState` até escolher produto+período |
| Lotes a Vencer | `paginas/LotesAVencerPage.tsx` | `Segmented` 30/60/90/180 + Depósito; `SemaforoValidade` por linha; cards no mobile |
| Componentes | `componentes/{SelectProduto,SelectDeposito}.tsx` | `SelectDeposito` pré-seleciona o padrão |

### Contratos confirmados na API real

- **Não aninhados**: `POST /estoque/depositos` (`{nome,codigo,tipo,padrao?}`),
  `POST /estoque/{entradas,saidas,ajustes}` recebem o command **plano** (sem `{dados}`).
- Movimentações retornam **`number[]`** (IDs de movimento — pode ser > 1 em FEFO).
- `GET /estoque/depositos` e `/lotes-a-vencer` **não são paginados** (array).
- `GET /estoque/kardex` retorna **404** se o `produtoId` não existir.
- Query params: mistura PascalCase/camelCase — enviamos camelCase (ASP.NET aceita).

### Preparo de ambiente para a homologação

O backend **não semeia** depósito nem cadastros de apoio. Sequência num
ambiente novo, toda pela UI:
1. `/produtos/novo` → modais "Gerenciar…" para criar Departamento + Grupo + Unidade → salvar 1 Produto.
2. `/estoque/depositos` → "Cadastrar depósito" (o principal) → "Definir como padrão".
3. `/estoque/entrada` → primeira entrada de saldo.
4. Conferir em `/estoque/posicao` e `/estoque/kardex`.

**Pendências:** E2E de estoque não escritos; `KardexPage` não tem tratamento
visual dedicado para 404 de produto (mostra tabela vazia).

**Gates locais:** lint / typecheck / test:unit (84) / build — verdes.
