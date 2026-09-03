---
título: Fase 3 — Geografia, Produtos e Clientes
versão do documento: 1.0
data: 2026-09-02
espelha: .docs/10-fase-3-cadastros.md (backend)
endpoints reais: GeografiaController, ProdutosController, CadastrosProdutoController, ClientesController, SegmentosController
---

# 07 — Fase 3: Geografia, Produtos e Clientes

## 7.1 Objetivo da fase

Os dois maiores cadastros do sistema — Produto e Cliente — mais a base
geográfica que ambos (e praticamente todo o resto do sistema) usam para
endereço. Esta é a fase com os formulários mais densos do MVP.

## 7.2 Geografia — componente transversal, não uma "tela de módulo"

Geografia (`GeografiaController`) é consumida majoritariamente **embutida**
em outras telas (endereço de Cliente, Fornecedor, Transportadora), não como
destino de navegação direta:

- `GET /geografia/paises`, `/estados`: carregados uma vez e cacheados
  (`staleTime` longo no TanStack Query — mudam raríssimo).
- `GET /geografia/estados/{estadoId}/cidades?termoBusca=`: alimenta o
  `SelectAutocomplete` (`05` §5.4) usado em todo campo "Cidade" do sistema
  — nunca uma lista de cidades carregada inteira (são milhares).
- `GET /geografia/ceps/{numero}`: usado para **preenchimento automático de
  endereço por CEP** — componente `<CampoCep>` que, ao perder foco com 8
  dígitos válidos, consulta o endpoint e preenche
  logradouro/bairro/cidade/UF automaticamente, deixando o usuário só
  confirmar número e complemento. Este é o único ponto de contato direto e
  frequente do usuário final com Geografia.
- Tela de manutenção (`/geografia/cidades`, `POST /geografia/cidades` e
  `/geografia/ceps`) existe mas é de uso raro/administrativo (cadastrar
  cidade ou CEP não encontrado na base) — não precisa de destaque no menu
  principal; fica dentro de "Sistema".

## 7.3 Produtos (`/produtos`)

Permissões: `Produtos.Consultar`, `Produtos.Gerenciar`.

### 7.3.1 Lista (`GET /produtos`, `ProdutoResumoDto`)

Colunas: Descrição, Código de barras, Preço de venda (`<MoneyInput>`
somente leitura formatado), Controla lote (ícone), Status.
Filtros: busca textual (`termoBusca` — busca por id, descrição **ou
qualquer código de barras**, conforme `IProdutoRepositorio.ListarAsync` —
o placeholder do campo deve deixar isso claro: "Buscar por descrição ou
código de barras"), Grupo (`grupoId`, `SelectAutocomplete` sobre `GET
/grupos`), `incluirInativos` (toggle).

### 7.3.2 Formulário (`ProdutoDto` / `DadosProduto` — 35 campos, 6 abas conforme `03` §3.3)

**Aba Dados gerais**: Descrição* (max 120), Descrição etiqueta, Código de
barras, Código de barras 2 (ambos verificados como únicos pelo backend —
erro 409 tratado especificamente: "Este código de barras já está em uso" —
ver `03` §3.5), Código de referência, Ativo (somente no Detalhe, via
ação Inativar/Reativar, nunca campo editável direto — `03` §3.2).

**Aba Classificação**: Departamento* (`SelectAutocomplete` sobre `GET
/departamentos`), Grupo* (`GET /grupos`), Subgrupo (`GET
/subgrupos?grupoId=` — **dependente do Grupo selecionado**, recarrega e
limpa a seleção se o Grupo mudar), Marca (`GET /marcas`), Laboratório (`GET
/laboratorios`), Fornecedor principal (`SelectAutocomplete` sobre `GET
/fornecedores`), Tipo de medicamento (`<Select>` enum `TipoMedicamento`:
Não medicamento / Ético / Genérico / Similar / OTC — rótulos amigáveis via
`rotulosEnum`, `03` §3.8).

**Aba Estoque**: Unidade de estoque* (`GET /unidades`), Quantidade por
embalagem* (>0), Estoque mínimo, Estoque máximo, Controla lote (switch),
Controla série (switch), Validade mínima em dias (só habilitado se
"Controla lote" ativo — regra de UX; backend só valida `>0` quando
informado), Considera estoque inteiro (switch, com texto de ajuda —
provavelmente relacionado a produtos fracionáveis). **Unidades
alternativas** — grid embutido editável (adicionar linha: Unidade, Fator de
conversão, É unidade de compra, É unidade de venda), salvo separadamente
via `PUT /produtos/{id}/unidades` (`DefinirUnidadesAlternativasCommand`) —
**só disponível no Detalhe** (produto precisa existir primeiro).

**Aba Preços**: Preço de custo* (≥0), Custo médio (somente leitura — campo
calculado pelo backend, ficará ativo a partir da Fase 7/Compras, `.docs/06`
D-34; nesta fase sempre igual ao custo informado), Preço de venda* (>0),
Margem padrão (%, opcional), Percentual de comissão (%, opcional) — estes
quatro últimos salvos separadamente via `PUT /produtos/{id}/precos`
(`DefinirPrecosDoProdutoCommand`), **também só no Detalhe** (mesmo padrão
do backend separar "criar produto" de "definir preço", refletindo que são
Commands distintos).

**Aba Regulatório**: Controlado (switch), Monitorado SNGPC (switch), Exige
receita (switch), Registro MS, Validade do registro MS (`<DatePickerBr>`),
Bloqueia venda se registro vencido (switch), Princípio ativo, DCB. Texto de
ajuda nesta aba deixa claro que produtos controlados terão exigências
adicionais de venda quando o módulo de Vendas existir (`.spec/10` RF-10.01
— fora do escopo desta fase, mas o cadastro já captura o dado agora).

**Aba Fiscal**: NCM (8 dígitos, validado — `03` §3.4), CEST, Origem da
mercadoria (`<Select>` enum `OrigemMercadoria`, 9 valores 0-8 — rótulos
completos da tabela de origem do ICMS/NF-e, não apenas o código).

### 7.3.3 Ações

Inativar/Reativar (`POST /produtos/{id}/inativar` | `/reativar`) via
`ConfirmDialog`.

## 7.4 Cadastros de apoio de Produto

Telas simples (uma por entidade), acessíveis a partir de um submenu
"Cadastros de apoio" dentro de Produtos — todas seguem o mesmo padrão
mínimo (lista + criar + renomear), sem paginação (retornos são
`IReadOnlyList`, volumes pequenos):

| Entidade | Endpoints | Campos |
|---|---|---|
| Marcas | `GET/POST /marcas`, `PUT /marcas/{id}` | Nome |
| Departamentos | `GET/POST /departamentos` | Nome |
| Grupos | `GET/POST /grupos` | Nome |
| Subgrupos | `GET /subgrupos?grupoId=`, `POST /subgrupos` | Nome, Grupo (obrigatório) |
| Laboratórios | `GET/POST /laboratorios` | Nome, CNPJ |
| Unidades | `GET/POST /unidades` | Sigla, Descrição, Permite fracionar (switch) |

Leitura liberada a qualquer usuário autenticado (sem policy no backend
além de `[Authorize]` simples); escrita exige `CadastrosApoio.Gerenciar`
(`03` §3.6). Melhor implementadas como **modais/drawers** a partir de um
botão "Gerenciar marcas" etc. dentro da própria tela de Produto (evita
sair do fluxo de cadastro de produto para criar uma marca nova), além de
uma tela de administração dedicada em Sistema para manutenção em lote.

## 7.5 Clientes (`/clientes`)

Permissões: `Clientes.Consultar`, `Clientes.Gerenciar`.

### 7.5.1 Lista (`GET /clientes`, `ClienteResumoDto`)

Colunas: Razão Social, Nome Fantasia, CPF/CNPJ (formatado com máscara),
Bloqueado (`<Tag>` vermelho se sim), Status. Filtros: busca textual,
Segmento (`segmentoId`), `incluirInativos`.

### 7.5.2 Formulário (`ClienteDto` / `DadosCliente` — 5 abas)

**Aba Dados gerais**: Tipo de pessoa* (`<Radio>` Física/Jurídica — muda a
máscara e o rótulo do campo seguinte), CPF/CNPJ* (máscara conforme tipo,
verificado como único pelo backend — 409 tratado, `03` §3.5), Inscrição
Estadual/RG, Razão Social*, Nome Fantasia, Ramo, Simples Nacional (switch,
só relevante se Jurídica), Órgão público (switch — conecta com Licitações
no futuro, `.spec/11`), Data de nascimento (só se Física), Segmento
(`SelectAutocomplete` sobre `GET /segmentos`).

Também nesta aba: **Endereço principal** (Cep com autopreenchimento — §7.2
— Logradouro, Número, Complemento, Bairro, Cidade) e **Contato principal**
(Email, Email financeiro, Telefone).

**Aba Endereços**: sub-listas geridas no Detalhe (produto precisa existir):
- Endereços de entrega (`POST /clientes/{id}/enderecos-entrega`):
  Destinatário, Cep, Logradouro, Número, Complemento, Bairro, Cidade,
  Padrão (switch — só um pode ser padrão, a UI desmarca os outros
  visualmente ao marcar um novo, mas quem decide a regra é o backend).
- Endereços de cobrança (`POST /clientes/{id}/enderecos-cobranca`):
  mesmos campos, sem Destinatário.
- Ambos exibidos como cards/lista, sem edição unitária exposta pelo
  backend nesta fase (só adicionar) — a tela não inventa `PUT`/`DELETE`
  que a API não tem.

**Aba Contatos** (`POST /clientes/{id}/contatos`): grid de contatos
adicionais — Nome*, Cargo, Email, Telefone.

**Aba Financeiro e crédito**: Prazo médio (dias), Limite de crédito
(`<MoneyInput>`, editado via `PUT /clientes/{id}/limite-credito` —
Command **separado** do restante do cadastro, mesmo padrão de Produto/preço
— provavelmente por ser uma ação sensível com trilha própria), Opera
somente à vista (switch), Desconto padrão (%). Também aqui: **Bloqueio**
— se `Bloqueado=true`, exibe o motivo e um botão "Desbloquear" (`POST
/clientes/{id}/desbloquear`); se não, botão "Bloquear" (`POST
/clientes/{id}/bloquear`, exige Motivo em texto — `ConfirmDialog` com
campo obrigatório, `05` §5.4).

**Aba Fiscal e regulatório**: Alvará, Validade do alvará
(`<DatePickerBr>`), Responsável técnico, Registro no conselho, Validade
mínima de produto em dias (regra de recebimento — provavelmente rejeita
produto com validade menor que X dias na entrega a este cliente), retenções
(5 switches: PIS, COFINS, IR, CSLL, INSS), e 5 campos de observação de
texto livre (Entrega, Faturamento, Almoxarifado, Nota fiscal, Geral) —
agrupados visualmente como "Observações" ao final da aba, coerente com o
uso operacional desses campos (instruções para separação/entrega, não dado
estruturado).

### 7.5.3 Ações

Bloquear/Desbloquear (§ acima), Inativar/Reativar, ambas via
`ConfirmDialog`.

## 7.6 Segmentos (`/clientes/segmentos` ou modal a partir de Clientes)

`GET/POST /segmentos`, `PUT /segmentos/{id}`: Nome, Órgão público (switch —
usado para filtrar/reportar clientes do setor público). Mesmo padrão simples
dos cadastros de apoio de Produto (§7.4).

## 7.7 Critério de pronto (Fase 3)

- CRUD completo de Produto com as 6 abas funcionais, incluindo unidades
  alternativas e definição de preços como ações pós-criação.
- CRUD completo de Cliente com as 5 abas, incluindo endereços/contatos,
  bloqueio/desbloqueio e limite de crédito.
- Autopreenchimento de endereço por CEP funcional e reutilizado em
  Produto/Cliente (mesmo componente, `03` §3.11 item 6).
- Cadastros de apoio (marcas, grupos, subgrupos, departamentos,
  laboratórios, unidades, segmentos) funcionais como modais embutidos.
- Testes de componente cobrindo pelo menos: submit de Produto válido,
  submit de Cliente válido, bloqueio de cliente exigindo motivo.
