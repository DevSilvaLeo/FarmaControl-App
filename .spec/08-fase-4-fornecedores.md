---
título: Fase 4 — Fornecedores e Força de Vendas
versão do documento: 1.0
data: 2026-09-02
espelha: .docs/11-fase-4-fornecedores.md (backend)
endpoints reais: FornecedoresController, TransportadorasController, RepresentantesController, VendedoresController
---

# 08 — Fase 4: Fornecedores e Força de Vendas

## 8.1 Objetivo da fase

O legado tinha uma única tabela `fornecedor` guarda-chuva misturando
fornecedor de mercadoria, transportadora, representante e funcionário. O
backend modelou isso como **três entidades independentes** (RA-09,
`.docs/06` D-32) — o frontend segue a mesma separação: três módulos de
cadastro distintos (não uma tela com um seletor de "tipo"), mais Vendedores
como quarto módulo relacionado (força de vendas interna/externa).

## 8.2 Componente comum — `DadosParceiro`

Os três cadastros (Fornecedor, Transportadora, Representante) compartilham
o mesmo bloco de identificação (`DadosParceiro` no backend): Tipo de
pessoa, CPF/CNPJ, Inscrição Estadual/RG, Razão Social, Nome Fantasia,
Email, Telefone, Endereço (Cep/Logradouro/Número/Complemento/Bairro/
Cidade). O frontend implementa isso como um **componente de formulário
reutilizável** (`<CamposDadosParceiro>`, em `modulos/fornecedores/
componentes/`), montado dentro de cada um dos três formulários — nunca
copiado e colado três vezes (mesmo raciocínio do backend ao extrair
`DadosParceiro` para não repetir validação de CPF/CNPJ, `.docs/06` D-32).

## 8.3 Fornecedores (`/fornecedores`)

Permissões: `Fornecedores.Consultar`, `Fornecedores.Gerenciar`.

- **Lista** (`GET /fornecedores`, `ParceiroResumoDto` — paginado): Razão
  Social, Nome Fantasia, CPF/CNPJ, Status. Filtro: busca textual,
  `incluirInativos`.
- **Formulário** (`FornecedorDto`): `<CamposDadosParceiro>` (§8.2), Ramo,
  Segmento (opcional, mesmo `SelectAutocomplete` de `GET /segmentos`), mais
  campos específicos de fornecedor: Prazo de entrega (dias), Tipo de frete
  (`<Select>` enum `TipoFrete`: CIF — frete por conta do remetente / FOB —
  frete por conta do destinatário — sempre com o texto explicativo, não só
  a sigla), Participa de cotação de frete (switch), Condição de pagamento
  padrão (texto — sem um cadastro de condições de pagamento ainda nesta
  fase, é campo livre no backend hoje), e a seção regulatória: Alvará,
  Validade do alvará, Responsável técnico, Registro no conselho (mesmos
  campos regulatórios do Cliente, §7.5.2 — reforça o componente
  compartilhado, ver §8.6 nota de refino futuro).
- Ações: Inativar/Reativar via `ConfirmDialog`.

## 8.4 Transportadoras (`/transportadoras`)

Permissões: mesmas de Fornecedores (`Fornecedores.Consultar`/`Gerenciar` —
o backend agrupa as três entidades sob o mesmo módulo de permissão,
"Fornecedores e força de vendas", `PermissoesConhecidas.Fornecedores`).

- **Lista** (`GET /transportadoras`, `ParceiroResumoDto`, paginado): mesmo
  padrão de Fornecedores.
- **Formulário** (`TransportadoraDto`): `<CamposDadosParceiro>`, mais
  Registro ANTT, Tipo de frete padrão (mesmo enum `TipoFrete`).
- Ações: Inativar/Reativar.
- Nota: Transportadora é referenciada por Cliente (`Cliente.
  TransportadoraId`, ver `.docs/06` D-32) — o `SelectAutocomplete` de
  transportadora usado na aba de endereço/entrega do Cliente (retrofit
  futuro, hoje o endpoint de Cliente ainda não expõe esse campo no DTO —
  ver nota em `07` — mas o cadastro já existe para quando for exposto).

## 8.5 Representantes (`/representantes`)

Permissões: mesmas do módulo (`Fornecedores.Consultar`/`Gerenciar`).

- **Lista** (`GET /representantes?incluirInativos=`, `RepresentanteDto` —
  **sem paginação**, lista simples): Razão Social, Nome Fantasia,
  CPF/CNPJ, Habilitado a assinar licitação (ícone), Status.
- **Formulário**: `<CamposDadosParceiro>` (subconjunto — sem os campos
  específicos de fornecedor/transportadora), mais Habilitado a assinar
  licitação (switch — campo que só fará sentido pleno quando o módulo de
  Licitações existir, `.spec/11`, mas já é capturado agora).
- Ações: Inativar (sem endpoint de reativar exposto para Representante
  nesta fase — a tela não inventa o que a API não tem, `03` §3.11 item 1).

## 8.6 Vendedores (`/vendedores`)

Permissões: `Vendedores.Consultar`, `Vendedores.Gerenciar`.

### 8.6.1 Lista (`GET /vendedores`, `VendedorResumoDto`, paginado)

Colunas: Nome, Interno (ícone), Externo (ícone), Recebe comissão (ícone),
Status.

### 8.6.2 Formulário (`VendedorDto` / `DadosVendedor`)

Nome*, CPF, Email, Telefone, Interno (switch), Externo (switch — os dois
não são mutuamente exclusivos no backend, a tela não força exclusividade),
Recebe comissão (switch — habilita a seção de metas abaixo), Comissão
percentual fixo (%, alternativa a "por margem"), Comissão por margem
(switch), Usuário vinculado (`SelectAutocomplete` sobre `GET /usuarios` —
liga o cadastro de vendedor a uma conta de login, quando o vendedor também
opera o sistema).

### 8.6.3 Metas de comissão (Detalhe → aba "Metas")

`PUT /vendedores/{id}/metas` (`DefinirMetasDeComissaoCommand`) recebe a
**lista completa** de faixas (substituição total, não incremento) — a UI é
um editor de tabela (`<Table>` editável do antd, ou grid customizado) com
colunas: Início da meta (data), Fim da meta (data), Valor da meta
(`<MoneyInput>`), Percentual de comissão (%). Regra de negócio do backend
(`.docs/06` D-33, `RN-03.02`): **faixas não podem se sobrepor no tempo** —
o frontend valida isso client-side antes de submeter (ordenar por início e
checar sobreposição), mas o erro definitivo, se o backend rejeitar mesmo
assim, aparece como 422 tratado normalmente (`03` §3.5) — a validação
client-side é só para poupar uma viagem ao servidor em erro óbvio.

### 8.6.4 Débitos (Detalhe → aba "Débitos")

`GET /vendedores/{id}/debitos` (lista simples) + `POST
/vendedores/{id}/debitos` (`RegistrarDebitoVendedorCommand`): Competência
(mês/ano), Valor, Motivo — tabela histórica **somente de inclusão** (sem
edição/exclusão exposta — é um registro de auditoria financeira, a UI trata
como append-only, mesmo espírito do livro-razão de Estoque na Fase 5).

### 8.6.5 Ações

Inativar/Reativar via `ConfirmDialog`.

## 8.7 Critério de pronto (Fase 4)

- CRUD completo de Fornecedores, Transportadoras e Representantes,
  reaproveitando `<CamposDadosParceiro>`.
- CRUD completo de Vendedores, incluindo editor de faixas de meta com
  validação de sobreposição e histórico de débitos.
- Nenhum dos três cadastros de parceiro duplica campos de identificação —
  auditoria de código confirma reuso do componente comum (§8.2).
