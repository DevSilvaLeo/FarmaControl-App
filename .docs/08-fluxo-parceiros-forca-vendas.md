---
título: Fluxo de UX — Fornecedores e Força de Vendas (Etapa 5)
versão do documento: 1.0
data: 2026-09-02
espelha: .spec/08-fase-4-fornecedores.md (contrato de API é lá; aqui é UX/layout)
---

# 08 — Fluxo de UX: Parceiros e Força de Vendas

Quatro módulos: Fornecedor, Transportadora, Representante (três entidades
independentes que compartilham identificação) e Vendedor.

## 8.1 `CamposDadosParceiro` — bloco reutilizável

`.spec/08` §8.2. O bloco de identificação comum (Tipo de pessoa, CPF/CNPJ,
IE/RG, Razão Social, Nome Fantasia, Email, Telefone, Endereço com `CampoCep`)
é **um componente de formulário** (`modulos/fornecedores/componentes/
CamposDadosParceiro.tsx`), montado dentro dos três formulários — nunca
copiado.

Comportamento igual ao bloco de identificação do Cliente (`07` §7.5.1): Tipo
de pessoa controla máscara/rótulo do documento; `CampoCep` preenche endereço.

Na revisão de código da etapa, auditar que **nenhum** dos três formulários
redigita esses campos (`.spec/08` §8.7).

## 8.2 Fornecedores (`/fornecedores`)

Permissões `Fornecedores.Consultar` / `Fornecedores.Gerenciar`.

**Lista** (paginada): Razão Social, Nome Fantasia, CPF/CNPJ (`mono`),
`StatusTag`. Filtro: busca + `incluirInativos`. Card mobile: Razão Social
`body-strong` + Nome Fantasia/documento em `caption`.

**Formulário.** `<CamposDadosParceiro>` + campos específicos, agrupados:
- `SectionCard` "Comercial": Ramo, Segmento (`SelectAutocomplete`), Prazo de
  entrega (dias), Tipo de frete (`<Select>` — **sempre com texto**: "CIF —
  frete por conta do remetente" / "FOB — frete por conta do destinatário",
  via `rotulosEnum` — `.spec/08` §8.3), Participa de cotação de frete
  (switch), Condição de pagamento padrão (texto livre — sem cadastro de
  condições ainda).
- `SectionCard` "Regulatório": Alvará, Validade do alvará (`DatePickerBr` +
  `SemaforoValidade`), Responsável técnico, Registro no conselho — mesmos
  campos regulatórios do Cliente.

Responsivo: `md:` abas roláveis / `lg:` 2 colunas por seção. Se couber em ≤ 2
telas de rolagem no mobile, pode ser scroll único com `SectionCard`s em vez
de `Steps` (critério: ≤ ~12 campos visíveis — `.spec/03` §3.2).

**Ações:** Inativar / Reativar via `ConfirmDialog`.

## 8.3 Transportadoras (`/transportadoras`)

Mesmas permissões do módulo (o backend agrupa as três sob "Fornecedores e
força de vendas" — `.spec/08` §8.4).

**Lista:** mesmo padrão de Fornecedores.

**Formulário:** `<CamposDadosParceiro>` + Registro ANTT + Tipo de frete
padrão (mesmo enum/rótulos).

**Ações:** Inativar / Reativar.

## 8.4 Representantes (`/representantes`)

**Lista** (sem paginação — lista simples): Razão Social, Nome Fantasia,
CPF/CNPJ, Habilitado a assinar licitação (ícone), `StatusTag`.

**Formulário:** subconjunto de `<CamposDadosParceiro>` (sem os campos de
fornecedor/transportadora) + switch "Habilitado a assinar licitação"
(`caption`: "Fará sentido pleno quando o módulo de Licitações existir; já é
capturado agora.").

**Ações:** apenas **Inativar** (o backend não expõe reativar para
Representante — a tela **não inventa** — `.spec/08` §8.5). O texto do
`ConfirmDialog` deixa claro que é irreversível por ora.

## 8.5 Vendedores (`/vendedores`)

Permissões `Vendedores.Consultar` / `Vendedores.Gerenciar`.

**Lista** (paginada): Nome, Interno (ícone), Externo (ícone), Recebe comissão
(ícone), `StatusTag`. Card mobile: Nome `body-strong` + linha de ícones
rotulados ("Interno · Externo · Comissão").

### 8.5.1 Formulário

`SectionCard` "Dados": Nome*, CPF (`mono`), Email, Telefone.
`SectionCard` "Atuação": Interno (switch), Externo (switch) — **não**
mutuamente exclusivos (a tela não força), Usuário vinculado
(`SelectAutocomplete` sobre `/usuarios`).
`SectionCard` "Comissão": Recebe comissão (switch — **habilita** o resto da
seção e a aba "Metas" no Detalhe), Comissão percentual fixo (%), Comissão por
margem (switch — alternativa ao percentual fixo; `caption` explicando que um
exclui o outro na prática).

### 8.5.2 Detalhe → aba "Metas" (grid embutido)

`PUT /vendedores/{id}/metas` recebe a **lista completa** (substituição total —
`.spec/08` §8.6.3). Editor:
- **Desktop:** `<Table>` editável — colunas Início (data), Fim (data), Valor
  da meta (`MoneyInput`), Percentual (%). Botão "+ Adicionar faixa".
- **Mobile:** cards editáveis (`03` §3.5), um por faixa.
- **Validação client-side de sobreposição** (`RN-03.02`): ordena por início e
  checa se alguma faixa invade o intervalo de outra. Faixas em conflito ganham
  borda `corErro` + um resumo no topo do grid ("2 faixas se sobrepõem no
  tempo"). O botão "Salvar metas" fica desabilitado enquanto houver
  sobreposição. Se ainda assim o backend recusar (422), trata como erro
  normal (`.spec/03` §3.5).

### 8.5.3 Detalhe → aba "Débitos" (append-only)

`GET` + `POST /vendedores/{id}/debitos` (`.spec/08` §8.6.4). Tabela
**histórica somente de inclusão** — sem editar/excluir. Linguagem visual de
"registro" (mesma de Kardex — `09` §9.5): linhas em `caption`, sem ícones de
ação, cabeçalho "Registro histórico — não editável". Botão "Registrar débito"
→ drawer com Competência (mês/ano), Valor (`MoneyInput`), Motivo
(obrigatório).

### 8.5.4 Ações de estado

Inativar / Reativar via `ConfirmDialog`.

## 8.6 Checklist de UX da etapa

- [ ] `<CamposDadosParceiro>` usado nos 3 formulários; zero duplicação
      (auditoria de código — `.spec/08` §8.7).
- [ ] Rótulos de enum (`TipoFrete`) sempre com texto explicativo, via
      `rotulosEnum.ts`.
- [ ] Editor de metas com validação visual de sobreposição no tempo.
- [ ] Débitos e Metas tratados como grid embutido responsivo (cards no
      mobile).
- [ ] Representante sem ação "Reativar" (não inventar contrato).
- [ ] Verificado em 375 / 768 / 1280.
