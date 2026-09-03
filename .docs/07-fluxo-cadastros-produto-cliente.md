---
título: Fluxo de UX — Geografia, Produto e Cliente (Etapa 4)
versão do documento: 1.0
data: 2026-09-02
espelha: .spec/07-fase-3-cadastros.md (contrato de API é lá; aqui é UX/layout)
---

# 07 — Fluxo de UX: Cadastros Centrais

Os dois formulários mais densos do MVP — Produto (35 campos, 6 abas) e
Cliente (5 abas) — agora **mobile-first**. Este documento resolve como isso
funciona num smartphone sem virar "utilizável mas horrível".

## 7.1 Geografia — transversal, não tela de menu

`.spec/07` §7.2. O contato do usuário com Geografia é quase todo via
componentes embutidos:

- **`CampoCep`** (`04-ui-kit.md` §4.3): o ponto de contato frequente. Ao sair
  do campo com 8 dígitos, consulta o CEP e preenche
  logradouro/bairro/cidade/UF; o usuário confirma número e complemento.
  Estados: ocioso → consultando (spinner no sufixo do input) → preenchido
  (campos abaixo ganham destaque sutil `primary/50` por 1s) → "CEP não
  encontrado" (libera edição manual + link "Cadastrar CEP" para quem tem
  `CadastrosApoio.Gerenciar`).
- **`SelectAutocomplete` de Cidade**: sempre busca no backend
  (`/estados/{id}/cidades?termoBusca=`), nunca lista inteira. Depende do
  Estado selecionado.
- Países/Estados: cacheados com `staleTime` longo (mudam raríssimo).
- Tela de manutenção `/geografia/cidades` fica **dentro de "Sistema"**, uso
  raro, padrão de lista simples.

## 7.2 Produto — Lista (`/produtos`)

**Filtros** (`03` §3.2): busca textual com placeholder **"Buscar por
descrição ou código de barras"** (o backend busca por id, descrição ou
qualquer código de barras — `.spec/07` §7.3.1); Grupo
(`SelectAutocomplete`); `incluirInativos` (toggle).

**Colunas desktop:** Descrição, Código de barras (`mono`), Preço de venda
(`MoneyInput` readonly, alinhado à direita), Controla lote (ícone),
`StatusTag`.

**Card mobile:** Descrição em `body-strong` + `StatusTag`; 2ª linha em
`caption`: `código de barras · R$ preço · "controla lote"` (quando aplica).
Toque → Detalhe.

## 7.3 Produto — Formulário (6 abas → 6 passos no mobile)

Agrupamento de campos por aba: **exatamente** a tabela de `.spec/03` §3.3 /
`.spec/07` §7.3.2 (Dados gerais · Classificação · Estoque · Preços ·
Regulatório · Fiscal).

### 7.3.1 Comportamento responsivo

| Largura | Forma |
|---|---|
| mobile (base) | `FormPage` em modo `Steps`: "Passo 1 de 6 — Dados gerais", uma seção por vez, `BottomActionBar` fixa (`[Voltar]` / `[Avançar]`, último passo `[Salvar]`), indicador de passos tocável com marcador de erro |
| `md:` | `<Tabs>` horizontais roláveis, coluna única de campos |
| `lg:`/`xl:` | `<Tabs>` completas; grid de 2 colunas por aba; `xl:` até 3 colunas nas abas Regulatório/Fiscal; `Affix` de `Salvar`/`Cancelar` |

### 7.3.2 Disclosure progressivo (regras de UX — o backend não força)

- **Validade mínima (dias)**: só habilita se **"Controla lote"** ligado
  (`.spec/07` §7.3.2). Desligar "Controla lote" limpa e desabilita o campo,
  com `caption` explicando.
- **Subgrupo**: depende de **Grupo**; recarrega opções e **limpa a seleção**
  se o Grupo mudar (`SelectAutocomplete dependeDe`).
- **"Considera estoque inteiro"**: `caption` fixo explicando (relação com
  produtos fracionáveis).
- Aba **Regulatório**: `<Alert type="info">` no topo — "Produtos controlados
  terão exigências adicionais de venda quando o módulo de Vendas existir. O
  cadastro já captura esses dados agora." (`.spec/07` §7.3.2).

### 7.3.3 Ações pós-criação (só no Detalhe)

Três blocos que **exigem o produto já existir** (Commands separados no
backend — `.spec/07` §7.3.2):

| Bloco | Endpoint | UX antes de existir |
|---|---|---|
| **Preços** (custo, preço venda, margem, comissão) | `PUT /produtos/{id}/precos` | na aba "Preços" do formulário de **criação**, mostrar os campos **desabilitados** com `caption`: "Salve o produto primeiro para definir os preços." Após salvar → redireciona ao Detalhe com a aba Preços destacada. |
| **Unidades alternativas** (grid embutido) | `PUT /produtos/{id}/unidades` | idem: aba "Estoque" mostra o grid desabilitado com a mesma mensagem. No Detalhe, grid editável (cards no mobile, tabela no `lg:` — `03` §3.5). Salva a **lista inteira**. |
| **Custo médio** | calculado pelo backend | campo **sempre somente leitura**; `caption`: "Calculado automaticamente a partir das entradas (ativo a partir do módulo de Compras)." |

### 7.3.4 Validação e erros

- Zod espelha `DadosProdutoValidator` 1:1 (`.spec/03` §3.4 / `.spec/07` tem o
  exemplo). Feedback inline por campo.
- **409 código de barras** (Código de barras / Código de barras 2, ambos
  únicos): toast de erro específico "Este código de barras já está em uso." +
  marca o campo correspondente em vermelho (`.spec/07` §7.3.2).
- **NCM**: máscara/validação 8 dígitos (`.spec/03` §3.4).
- 400 do backend → `setError` campo a campo, e **pula para o passo/aba que
  contém o primeiro campo com erro** (mobile: navega o Step; desktop: ativa a
  Tab e rola até o campo).

### 7.3.5 Cadastros de apoio sem sair do fluxo

`.spec/07` §7.4. Ao lado de cada `SelectAutocomplete` de Marca / Grupo /
Subgrupo / Departamento / Laboratório / Unidade, um link discreto **"Gerenciar
marcas"** (só com `CadastrosApoio.Gerenciar`) que abre um **modal** (`md:+`) /
**drawer de baixo** (mobile) com lista + criar + renomear. Ao criar, a nova
opção já volta selecionada no campo de origem — o usuário não perde o
formulário de produto.

Além disso, uma tela de administração dedicada em "Sistema" para manutenção
em lote.

### 7.3.6 Ações de estado

Inativar / Reativar no action sheet (mobile) / barra de ações (desktop) do
Detalhe, via `ConfirmDialog` (`.spec/07` §7.3.3).

## 7.4 Cliente — Lista (`/clientes`)

**Filtros:** busca textual; Segmento (`SelectAutocomplete`); `incluirInativos`.

**Colunas desktop:** Razão Social, Nome Fantasia, CPF/CNPJ (`mono`,
mascarado), Bloqueado (`StatusTag` vermelho se sim), `StatusTag` de
Ativo/Inativo.

**Card mobile:** Razão Social em `body-strong`; Nome Fantasia + CPF/CNPJ em
`caption`; se `Bloqueado`, um `StatusTag` "Bloqueado" vermelho em destaque no
canto.

## 7.5 Cliente — Formulário (5 abas → 5 passos no mobile)

Abas: **Dados gerais · Endereços · Contatos · Financeiro e crédito · Fiscal e
regulatório** (`.spec/07` §7.5.2). Mesmo comportamento responsivo do Produto
(§7.3.1).

### 7.5.1 Aba Dados gerais

- **Tipo de pessoa** (`<Radio>` Física / Jurídica) — muda máscara e rótulo do
  documento (CPF ↔ CNPJ), e mostra/esconde: Data de nascimento (só Física),
  Simples Nacional (só Jurídica), Inscrição Estadual/RG (rótulo muda).
- **CPF/CNPJ**: máscara conforme tipo, único (409 tratado — "Este
  CPF/CNPJ já está cadastrado.").
- **Endereço principal** (com `CampoCep`) e **Contato principal** (Email,
  Email financeiro, Telefone) ficam nesta aba (`.spec/07` §7.5.2).
- **Órgão público** (switch) — `caption`: "Usado para relatórios e, no futuro,
  para o módulo de Licitações."

### 7.5.2 Abas Endereços e Contatos (só no Detalhe)

Sub-listas geridas após o cliente existir (`.spec/07` §7.5.2):
- **Endereços de entrega / cobrança**: exibidos como cards; "Adicionar" abre
  drawer com o mini-formulário (Destinatário só em entrega; `CampoCep`; campos
  de endereço). Switch "Padrão" — só um pode ser padrão; ao marcar um novo, a
  UI **desmarca visualmente** os outros, mas a regra é do backend. **Sem
  editar/excluir** (o backend só expõe adicionar — a tela não inventa
  `PUT`/`DELETE`).
- **Contatos adicionais**: grid — Nome*, Cargo, Email, Telefone (cards no
  mobile, tabela editável no `lg:`).

### 7.5.3 Aba Financeiro e crédito

- **Limite de crédito**: `MoneyInput`, mas salvo via **ação separada** `PUT
  /clientes/{id}/limite-credito` (`.spec/07` §7.5.2) — na UI, um bloco
  próprio "Limite de crédito" com o valor atual + botão "Alterar limite" →
  `ConfirmDialog` com o novo valor (ação sensível, trilha própria). Não é um
  campo salvo junto com o resto do formulário.
- Prazo médio (dias), Opera somente à vista (switch), Desconto padrão (%).
- **Bloqueio**: se `Bloqueado=true` → exibe o **motivo** (`SectionCard` com
  fundo `corErroFundo`) + botão "Desbloquear" (`POST .../desbloquear`). Se
  não → botão "Bloquear" → `ConfirmDialog` com **campo Motivo obrigatório**
  (`BloquearClienteCommand.Motivo` — `.spec/07` §7.5.2 / `.spec/05` §5.4).

### 7.5.4 Aba Fiscal e regulatório

- Alvará, Validade do alvará (`DatePickerBr` + `SemaforoValidade` ao lado
  mostrando dias para vencer), Responsável técnico, Registro no conselho,
  Validade mínima de produto (dias).
- **5 switches de retenção** (PIS, COFINS, IR, CSLL, INSS) agrupados num
  `SectionCard` "Retenções".
- **5 campos de observação** (Entrega, Faturamento, Almoxarifado, Nota
  fiscal, Geral) agrupados ao final num `SectionCard` "Observações" —
  `<textarea>` de texto livre, `caption`: "Instruções operacionais impressas
  em documentos de separação/entrega." (`.spec/07` §7.5.2).

### 7.5.5 Ações de estado

Bloquear/Desbloquear (§7.5.3), Inativar/Reativar — todas via `ConfirmDialog`.

## 7.6 Segmentos (`/clientes/segmentos` ou modal)

Padrão simples (lista + criar + renomear), igual aos cadastros de apoio de
Produto: Nome, Órgão público (switch). Acessível como modal a partir do
`SelectAutocomplete` de Segmento no formulário de Cliente.

## 7.7 Checklist de UX da etapa

- [ ] Produto e Cliente **operáveis** ponta a ponta num viewport de 375px
      (criar, navegar abas/passos, salvar).
- [ ] Abas com erro de validação sinalizadas; submit inválido leva o foco ao
      primeiro campo com erro.
- [ ] Ações pós-criação (preços, unidades) com afordância clara de "salve
      primeiro".
- [ ] `CampoCep` reutilizado **igual** em Produto (fornecedor? não — em
      Cliente e nos parceiros da Etapa 5) e Cliente (`.spec/07` §7.7).
- [ ] Cadastros de apoio abrem como modal/drawer sem descartar o formulário
      de origem.
- [ ] Bloqueio de cliente exige motivo; limite de crédito é ação isolada.
- [ ] Verificado em 375 / 768 / 1280.

---

## 7.8 Implementação (Etapa 4 — concluída 2026-09-03)

Construída contra o **Swagger real** (backend no ar) — `src/tipos/api.gerado.ts`.

| Tela / peça | Arquivo |
|---|---|
| Geografia (transversal) | `modulos/geografia/{api.ts,hooks/useGeografia.ts}` + **`componentes/CampoEndereco.tsx`** (CEP autopreenche + Estado→Cidade autocomplete) |
| Produto — lista / form (6 abas) / detalhe | `modulos/produtos/paginas/Produto{Lista,Form,Detalhe}Page.tsx` |
| Produto — apoio | `componentes/{CamposApoioProduto,GerenciarApoioModal}.tsx` (Marca/Departamento/Grupo/Subgrupo/Laboratório/Unidade) |
| Cliente — lista / form (5 abas) / detalhe | `modulos/clientes/paginas/Cliente{Lista,Form,Detalhe}Page.tsx` |
| Cliente — sub-recursos | `componentes/{GerenciarSegmentosModal,AdicionarEnderecoDrawer}.tsx` + modal de contato inline |
| Campos de formulário reutilizáveis | `compartilhado/ui/campos.tsx` (`CampoSelect`, `CampoSwitch`, `CampoNumero`, `CampoMoeda`, `CampoData`) |
| Erros 400 → campos RHF | `compartilhado/api/errosDeFormulario.ts` (`aplicarErrosDeCampo`) |

### Reconciliação de contratos

- **Criação aninhada**: `POST /produtos` e `POST /clientes` recebem `{ dados: … }`
  (o `PUT` recebe o objeto plano). Confirmado por 400 do backend.
- **Erros de campo do backend** vêm com prefixo `Dados.` e segmentos em
  PascalCase (`Dados.DepartamentoId`) — `aplicarErrosDeCampo` normaliza para
  `departamentoId`.
- **Ações separadas**: `PUT /produtos/{id}/precos`, `PUT /produtos/{id}/unidades`
  (array direto), `PUT /clientes/{id}/limite-credito` (`{limite}`),
  `POST /clientes/{id}/bloquear` (`{motivo}`).
- **Sub-recursos do Cliente são append-only** (só `POST`): endereços e contatos
  aparecem como cards + "Adicionar", sem editar/remover.
- Query de lista: `Pagina/TamanhoPagina/TermoBusca/GrupoId|SegmentoId/IncluirInativos`
  (PascalCase; ASP.NET aceita case-insensitive — enviamos camelCase).
- `custoMedio` só leitura; `vendedorId`/`transportadoraId` do Cliente **ocultos**
  até a Etapa 5.
- Fix de passagem: `CampoCep` com sufixo de largura fixa (evita perder foco no antd).

### Estado do backend

Os cadastros de apoio (marcas, grupos, departamentos, segmentos) e Produto/Cliente
**não têm seed** — a primeira ação num ambiente novo é criar Departamento + Grupo
+ Unidade pelos modais de "Gerenciar…" dentro do formulário de Produto.

**Pendências:** E2E (`produto.spec.ts`/`cliente.spec.ts`) não criados — os
fluxos foram validados via contrato (400/GET) contra a API real, sem gerar
dados persistentes no banco de desenvolvimento do usuário.

**Gates locais:** lint / typecheck / test:unit (71) / build — verdes.
