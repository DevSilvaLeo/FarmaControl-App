---
título: Backlog de Telas — Fases Futuras (a partir de Vendas)
versão do documento: 1.0
data: 2026-09-02
fonte: .spec/04, 06, 07, 08, 09, 10, 11, 12, 13 (projeto) — nenhum endpoint destas áreas existe ainda no backend
---

# 10 — Backlog de Telas: Fases Futuras

## 10.1 Como usar este documento

Ao contrário dos documentos `04` a `09` (que espelham endpoints reais já
implementados), este documento é um **inventário de telas em nível de
especificação funcional** — não tem campo-a-campo nem contrato de API,
porque a API correspondente ainda não existe no backend. Isso é
**intencional**, e segue exatamente o método que o próprio backend adota
(`.docs/05-roadmap-de-fases.md`, seção "Fases 6–7": *"Detalhamento em cada
fase, no momento de iniciá-la, criando `.docs/0X-fase-N-<nome>.md`"*).

**Regra**: quando o backend iniciar uma destas fases, este documento deve
ser **desmembrado** em um novo `1X-fase-N-<nome>.md` no mesmo nível de
detalhe de `07`/`08`/`09` (campos reais dos DTOs/Commands, endpoints reais,
enums reais) — nunca construir a tela a partir da suposição feita aqui. As
seções abaixo existem para: (a) dar visibilidade de escopo total do
produto, (b) permitir planejamento de UX antecipado (fluxos, não campos),
e (c) apontar decisões arquiteturais do frontend que **antecipam** essas
fases (ex.: componentes genéricos que já devem ser pensados para
reaproveitamento, como o motor de status configurável do Pedido).

## 10.2 Fase 6 — Vendas: Pré-Pedido → Pedido (fecha o MVP do backend)

Fonte: `.spec/04-vendas-pedidos.md`. Próxima fase candidata do backend
(`.docs/05`, junto com `PR 5b`).

Telas previstas:

- **Pré-pedido** (`/vendas/pre-pedidos`): lista + formulário de orçamento
  do vendedor, itens com produto/quantidade/preço, cálculo de tributos por
  item (RF-04.02) exibido como preview antes de confirmar.
- **Pedido** (`/vendas/pedidos`): lista com **máquina de estados
  visual** — o pedido percorre uma situação configurável em tabela
  (`situacaopedido`, não um enum fixo no legado; o backend decidiu por
  enum fixo no MVP, `.docs/06` D-03) — a tela deve renderizar a situação
  atual como um `<Steps>`/timeline do Ant Design, com histórico completo
  de transições (`pedidosituacao` — RF-04.05) visível no Detalhe.
- **Componente antecipado**: um `<LinhaDoTempoDeStatus>` genérico (lista
  de {status, usuário, data/hora}) vale a pena ser construído já na Fase 1
  cross-cutting (`05`) mesmo sem uso imediato, porque Pedido, e depois OS
  (Fase 8+, `.spec/12`), precisam exatamente do mesmo padrão visual — o
  backend já recomenda unificar esse padrão (`.spec/12` §12.3,
  recomendação explícita de não duplicar o modelo de `os`).
- **Aprovação de exceção** (RF-04.06): quando um pedido é bloqueado por
  limite de crédito/inadimplência/licença vencida/estoque insuficiente, a
  tela deve expor um fluxo estruturado de "liberar com justificativa"
  (nunca um campo de texto livre — o `.spec` recomenda abandonar os
  campos `auto-*` de texto livre do legado em favor de registro
  estruturado, RF-04.06) — modal com motivo pré-definido + usuário
  aprovador + observação.
- **Condição de pagamento** (`/vendas/condicoes-pagamento`): cadastro de
  parcelas com percentual proporcional e regra de dia útil (RF-04.07).
- **Carta de Adequação** (RF-04.10): tela específica para formalizar
  entrega parcial em contrato público/hospitalar — provavelmente acessada
  a partir do Detalhe do Pedido, não como módulo independente.
- **Volumes de expedição** (RF-04.08): sub-tela do Pedido para organizar
  itens em caixas/paletes antes da separação — conecta com Logística
  (§10.6).

## 10.3 Fase 7 — Compras e Entradas

Fonte: `.spec/06-compras-entradas.md`.

- **Ordem de compra** (`/compras/ordens`): formulário com itens,
  **cotação comparativa** por fornecedor (RF-06.01 — grid onde cada item
  pode ter mais de uma proposta de fornecedor, com marcação de qual foi
  aprovada), fluxo de aprovação antes do envio (RF-06.03).
- **Entrada fiscal** (`/compras/entradas`): lançamento de nota fiscal de
  compra, tributação completa por item (RF-06.04), vínculo com ordem(ns)
  de compra de origem (RF-06.09) para conferência de divergência
  quantidade/preço.
- **Importação — Declaração de Importação** (`/compras/importacoes`):
  tela específica para produtos importados diretamente (RF-06.05/06.06) —
  módulo avançado, só relevante se o cliente de fato importa (confirmar
  volume real de uso antes de priorizar, `.spec/06` PA-24/25 ficam para o
  time de produto decidir).
- Ao concluir esta fase, a tela de **Estoque → Entrada avulsa** (`09`
  §9.3.1) deve ganhar uma nota atualizada: entrada com documento fiscal
  passa a existir como fluxo separado e preferencial; a entrada avulsa
  continua existindo para casos sem nota (ajuste, doação, amostra).

## 10.4 Fase 8+ — Fiscal e Tributário

Fonte: `.spec/07-fiscal.md`. **A maior e mais complexa área do sistema**
(63 tabelas no legado) — recomenda-se tratar como sub-fases próprias, não
uma fase única:

- **Emissão de NF-e/NFC-e** (`/fiscal/notas-fiscais`): tela de emissão a
  partir de um Pedido faturável, com acompanhamento de status de
  transmissão SEFAZ em tempo real (enviando → autorizada/rejeitada/
  contingência) — candidata a usar polling ou, se o backend expuser,
  WebSocket/SSE para não exigir refresh manual em um processo que pode
  levar segundos.
- **Motivos de rejeição** (RF-07.08): a tela de erro de NF-e deve
  traduzir o código de rejeição da SEFAZ usando o catálogo do backend
  (`listarejeicaonfe`), nunca mostrar só o código bruto ao usuário fiscal.
- **Carta de Correção, Cancelamento, Inutilização**: ações sobre uma NF-e
  já emitida, cada uma com sua janela de prazo legal (RN-07.02) — a UI
  deve desabilitar essas ações fora do prazo, com texto explicando por
  quê, quando o backend implementar esse controle (`.spec/07` PA-27,
  hoje em aberto mesmo na especificação).
- **Motor de regras fiscais** (`operação × tipotrib × UF`): provavelmente
  não uma tela de "edição direta" pelo usuário comum — mais uma tela de
  administração fiscal avançada, de uso raro e por perfil especializado.
  Vale considerar, desde já, que este é o único módulo do sistema onde
  um assistente/simulador ("qual a tributação desta operação?") agrega
  mais valor de UX do que um formulário de CRUD puro.
- **NFS-e** (`/fiscal/notas-servico`): emissão de nota de serviço,
  parametrizada por município (cada prefeitura tem layout próprio,
  RF-07.02) — escopo de integração a dimensionar com o cliente antes de
  desenhar a tela (`.spec/07` PA-28).
- **GNRE e SPED** (`/fiscal/obrigacoes-acessorias`): geração de guias e
  arquivos de obrigação acessória — telas de geração/download de arquivo,
  não de edição de dado transacional.

## 10.5 Fase 8+ — Financeiro

Fonte: `.spec/08-financeiro.md`.

- **Contas a Pagar** (`/financeiro/contas-a-pagar`) e **Contas a Receber**
  (`/financeiro/contas-a-receber`): listas com filtro por vencimento
  (vencidos/a vencer), ação de **baixa** (parcial ou total, com
  juros/multa/desconto — RF-08.02) via modal dedicado, nunca inline na
  grade (a baixa tem regras demais para caber numa edição de célula).
- **Reparcelamento** (RF-08.03): fluxo de selecionar um ou mais títulos
  vencidos e gerar novo(s) parcelamento(s), preservando o vínculo com os
  títulos originais visível no histórico.
- **Boletos** (`/financeiro/boletos`): emissão e acompanhamento de
  remessa/retorno bancário — tela de "conciliação" mostrando o resultado
  do processamento de um arquivo de retorno em lote (RF-08.04).
- **Plano de contas / Centro de custo** (`/financeiro/plano-de-contas`):
  cadastro hierárquico em árvore (o backend já teria migrado do modelo
  antigo `plano` para `planon`, `.spec/08` §8.4) — componente de árvore
  editável (`<Tree>` do antd).
- **Painel de fluxo de caixa** (não mapeado 1:1 a uma tabela, mas
  implícito no domínio) — bom candidato a dashboard com gráfico, quando o
  módulo existir.

## 10.6 Fase 8+ — Logística e Entrega

Fonte: `.spec/09-logistica-entrega.md`.

- **Rotas e Frota** (`/logistica/rotas`, `/logistica/veiculos`): cadastros
  relativamente simples, mesmo padrão de lista+formulário das Fases 3/4.
- **Manifesto de carga / Borderô** (`/logistica/manifestos`): tela de
  "montagem de carga" — selecionar pedidos/NFs de uma rota e agrupar em
  manifesto antes da saída (RF-09.01), provavelmente com interface de
  arrastar-e-soltar ou seleção múltipla em lista.
- **CT-e / MDF-e** (`/logistica/cte`, `/logistica/mdfe`): mesmo padrão de
  acompanhamento de transmissão SEFAZ do módulo Fiscal (§10.4) — reusar o
  componente de "status de transmissão eletrônica" entre os três
  documentos (NF-e, CT-e, MDF-e) em vez de reconstruir para cada um.
- **Verba de viagem** (`/logistica/verba-viagem`): adiantamento e
  prestação de contas (RF-09.05) — formulário de itinerário +
  lançamento de despesas por cidade, com totais previsto × realizado em
  destaque (é o dado que mais importa para quem aprova a prestação de
  contas).

## 10.7 Fase 8+ — Controlados e Regulatório

Fonte: `.spec/10-controlados-regulatorio.md`.

- **SNGPC** (`/regulatorio/sngpc`): geração de escrituração periódica —
  o `.spec` recomenda explicitamente mapear os campos genéricos `c1..c18`
  do legado para nomes de negócio (§10.3) — o frontend só deve ser
  construído depois que o backend definir esse mapeamento nomeado; não
  construir tela sobre `c1..c18` genéricos.
- **Receita e prescritor** (integrado à tela de Pedido/item de venda de
  produto controlado, RF-10.01) — não é módulo próprio, é um bloco
  condicional que aparece no formulário de item de pedido quando
  `Produto.Controlado=true`.
- **Licenças e documentos com validade** (`/regulatorio/licencas`):
  cadastro + **painel de vencimentos** (RF-10.04/10.06) — bom candidato a
  widget no painel inicial (mesma ideia de "Lotes a Vencer", `09` §9.6) e
  a notificação por usuário responsável, quando o backend suportar.
- **Anexos genéricos** (RF-10.05): um componente `<PainelDeAnexos>`
  reutilizável (upload + lista + quem incluiu/quando), montado sobre
  qualquer entidade que precise anexar arquivo — vale a pena desenhar
  como componente compartilhado desde que a primeira entidade precisar
  dele, não reconstruir por módulo.

## 10.8 Fase 8+ — Licitações

Fonte: `.spec/11-licitacoes.md`. Área de negócio típica de distribuidoras
que vendem para o setor público (`.spec/00` §0.8) — alta prioridade de
negócio, mesmo sendo backlog técnico.

- **Funil de oportunidades** (`/licitacoes/agenda`): lista tipo kanban ou
  lista com situação (em análise / descartada / convertida — RF-11.01) —
  boa candidata a visualização kanban dado que é literalmente um funil de
  decisão.
- **Proposta por item** (`/licitacoes/:id/itens`): grid de itens com
  preço ofertado × valor-teto do edital × margem calculada em tempo real
  (RF-11.02) — campo de margem deve recalcular ao digitar o preço, sem
  esperar submissão.
- **Rodada de lance** (RF-11.03): suporte a uma segunda proposta
  ("lance final") no mesmo item — UI deve deixar claro visualmente qual é
  a proposta inicial e qual é o lance final, lado a lado.
- **Acompanhamento de saldo do contrato** (RF-11.04): painel mostrando
  quantidade contratada × consumida × saldo restante por item, ao longo
  da vigência — essencial para o time comercial não vender além do
  contratado.
- **Realinhamento de preço** (RF-11.05) e **Aditivos** (RF-11.06): fluxos
  de solicitação formal, provavelmente com estado próprio (rascunho →
  solicitado → aprovado).

## 10.9 Fase 8+ — Ordens de Serviço e Produção

Fonte: `.spec/12-os-producao.md`. Dois processos distintos, dois módulos:

- **Ordem de Serviço** (`/os`): assistência técnica — o `.spec` já
  recomenda (§12.3) que o histórico de status use o **mesmo padrão** do
  Pedido (linha de status por transição, não colunas fixas) — reusar o
  `<LinhaDoTempoDeStatus>` antecipado em §10.2.
- **Ordem de Produção** (`/producao/ordens`): fabricação/manipulação —
  tela com **ficha técnica** (BOM — lista de matérias-primas e
  quantidades, RF-12.03) e **roteiro de setores** (sequência visual, tipo
  stepper, RF-12.03) — ao fechar a ordem, exibir rendimento apurado
  (útil/ganho/perda, RF-12.05) de forma destacada, é o dado que o
  responsável de produção mais precisa ver.
- Confirmar com o cliente, antes de priorizar (`.spec/12` PA-39), se este
  módulo é linha de negócio ativa — pode ser descontinuado no legado.

## 10.10 Fase 8+ — Sistema e Integrações (avançado)

Fonte: `.spec/13-sistema-usuarios-integracoes.md`. Parte básica (Usuários,
Perfis, Empresas/Filiais) já existe desde a Fase 2 (`06`); esta seção cobre
o que falta:

- **Parâmetros do sistema** (`/sistema/parametros`): tela de configuração
  organizada **por módulo/categoria** (RF-13.03) — o `.spec` recomenda
  abandonar o modelo de 375 colunas achatadas (`config`) por um modelo de
  parâmetro categorizado com histórico; a tela deve ser genérica o
  suficiente para renderizar qualquer parâmetro futuro sem mudança de
  código (formulário guiado por metadado, não por campo hardcoded).
- **Agendador de tarefas** (`/sistema/agendador`): cadastro de rotinas
  automáticas + log de execução (RF-13.04).
- **Tarefas internas** (`/sistema/tarefas`): módulo tipo "to-do" interno,
  com desmembramento em subtarefas (RF-13.05) — possível candidato a
  reaproveitar um componente de board/lista já usado no Funil de
  Licitações (§10.8), avaliar quando ambos existirem.
- **Importação de XML** (`/sistema/importacao-xml`): upload de XML de
  NF-e/CT-e de terceiro para pré-preencher Entrada/Frete (RF-13.06) —
  tela de upload + preview do que foi extraído antes de confirmar.
- **Integrações externas** (Wamas/WMS, Moskit/CRM): telas de
  configuração/log de sincronização — só priorizar após confirmar com o
  cliente se essas integrações estão realmente ativas hoje (`.spec/13`
  PA-43).

## 10.11 Nota final sobre este documento

Este backlog **não tem estimativa de esforço nem ordem de prioridade
comercial** — isso é decisão do PO/cliente, não da especificação técnica.
A ordem de dependência técnica (o que precisa vir antes do quê) está em
`11-roadmap-de-fases.md`.
