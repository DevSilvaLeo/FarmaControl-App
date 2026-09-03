import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Skeleton } from 'antd';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoData, CampoMoeda, CampoNumero, CampoSelect, CampoSwitch } from '@/compartilhado/ui/campos';
import { SelectAutocomplete } from '@/compartilhado/ui/SelectAutocomplete';
import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import { aplicarErrosDeCampo } from '@/compartilhado/api/errosDeFormulario';
import { opcoesDe, rotulosOrigemMercadoria, rotulosTipoMedicamento } from '@/compartilhado/utils/rotulosEnum';
import { produtoSchema, type ProdutoForm } from '../validacao';
import { useProduto, useSalvarProduto } from '../hooks/useProdutos';
import type { DadosProduto, ProdutoDto } from '../tipos';
import { CamposApoioProduto } from '../componentes/CamposApoioProduto';

const VAZIO: ProdutoForm = {
  descricao: '',
  descricaoEtiqueta: '',
  codigoBarras: '',
  codigoBarras2: '',
  codigoReferencia: '',
  departamentoId: undefined as unknown as number,
  grupoId: undefined as unknown as number,
  subgrupoId: null,
  marcaId: null,
  laboratorioId: null,
  fornecedorPrincipalId: null,
  tipoMedicamento: 'NaoMedicamento',
  unidadeEstoqueId: undefined as unknown as number,
  quantidadePorEmbalagem: 1,
  estoqueMinimo: 0,
  estoqueMaximo: 0,
  controlaLote: false,
  controlaSerie: false,
  validadeMinimaDias: null,
  consideraEstoqueInteiro: false,
  precoCusto: 0,
  precoVenda: 0,
  margemPadrao: null,
  percentualComissao: null,
  controlado: false,
  monitoradoSngpc: false,
  exigeReceita: false,
  registroMs: '',
  validadeRegistroMsUtc: null,
  bloqueiaVendaSeRegistroVencido: false,
  principioAtivo: '',
  dcb: '',
  ncm: '',
  cest: '',
  origemMercadoria: 'Nacional',
};

function dtoParaForm(p: ProdutoDto): ProdutoForm {
  return {
    ...VAZIO,
    descricao: p.descricao,
    descricaoEtiqueta: p.descricaoEtiqueta ?? '',
    codigoBarras: p.codigoBarras ?? '',
    codigoBarras2: p.codigoBarras2 ?? '',
    codigoReferencia: p.codigoReferencia ?? '',
    departamentoId: p.departamentoId as number,
    grupoId: p.grupoId as number,
    subgrupoId: p.subgrupoId ?? null,
    marcaId: p.marcaId ?? null,
    laboratorioId: p.laboratorioId ?? null,
    fornecedorPrincipalId: p.fornecedorPrincipalId ?? null,
    tipoMedicamento: p.tipoMedicamento,
    unidadeEstoqueId: p.unidadeEstoqueId as number,
    quantidadePorEmbalagem: p.quantidadePorEmbalagem,
    estoqueMinimo: p.estoqueMinimo,
    estoqueMaximo: p.estoqueMaximo,
    controlaLote: p.controlaLote,
    controlaSerie: p.controlaSerie,
    validadeMinimaDias: p.validadeMinimaDias ?? null,
    consideraEstoqueInteiro: p.consideraEstoqueInteiro,
    precoCusto: p.precoCusto,
    precoVenda: p.precoVenda,
    margemPadrao: p.margemPadrao ?? null,
    percentualComissao: p.percentualComissao ?? null,
    controlado: p.controlado,
    monitoradoSngpc: p.monitoradoSngpc,
    exigeReceita: p.exigeReceita,
    registroMs: p.registroMs ?? '',
    validadeRegistroMsUtc: p.validadeRegistroMsUtc ?? null,
    bloqueiaVendaSeRegistroVencido: p.bloqueiaVendaSeRegistroVencido,
    principioAtivo: p.principioAtivo ?? '',
    dcb: p.dcb ?? '',
    ncm: p.ncm ?? '',
    cest: p.cest ?? '',
    origemMercadoria: p.origemMercadoria,
  };
}

const limpo = (s?: string | null) => (s && s.trim() !== '' ? s.trim() : null);

function formParaDados(f: ProdutoForm): DadosProduto {
  return {
    descricao: f.descricao.trim(),
    descricaoEtiqueta: limpo(f.descricaoEtiqueta),
    codigoBarras: limpo(f.codigoBarras),
    codigoBarras2: limpo(f.codigoBarras2),
    codigoReferencia: limpo(f.codigoReferencia),
    departamentoId: f.departamentoId,
    grupoId: f.grupoId,
    subgrupoId: f.subgrupoId ?? null,
    marcaId: f.marcaId ?? null,
    laboratorioId: f.laboratorioId ?? null,
    fornecedorPrincipalId: f.fornecedorPrincipalId ?? null,
    unidadeEstoqueId: f.unidadeEstoqueId,
    quantidadePorEmbalagem: f.quantidadePorEmbalagem,
    estoqueMinimo: f.estoqueMinimo ?? 0,
    estoqueMaximo: f.estoqueMaximo ?? 0,
    controlaLote: !!f.controlaLote,
    controlaSerie: !!f.controlaSerie,
    validadeMinimaDias: f.controlaLote ? (f.validadeMinimaDias ?? null) : null,
    consideraEstoqueInteiro: !!f.consideraEstoqueInteiro,
    controlado: !!f.controlado,
    monitoradoSngpc: !!f.monitoradoSngpc,
    exigeReceita: !!f.exigeReceita,
    registroMs: limpo(f.registroMs),
    validadeRegistroMsUtc: f.validadeRegistroMsUtc ?? null,
    bloqueiaVendaSeRegistroVencido: !!f.bloqueiaVendaSeRegistroVencido,
    principioAtivo: limpo(f.principioAtivo),
    dcb: limpo(f.dcb),
    tipoMedicamento: f.tipoMedicamento,
    ncm: limpo(f.ncm),
    cest: limpo(f.cest),
    origemMercadoria: f.origemMercadoria,
    precoCusto: f.precoCusto,
    precoVenda: f.precoVenda,
    margemPadrao: f.margemPadrao ?? null,
    percentualComissao: f.percentualComissao ?? null,
  };
}

async function buscarFornecedores(termo: string) {
  const { data } = await clienteHttp.get<{ itens: { id: number; razaoSocial: string }[] }>(
    '/fornecedores',
    { params: { termoBusca: termo, pagina: 1, tamanhoPagina: 20 } },
  );
  return (data.itens ?? []).map((f) => ({ value: f.id, label: f.razaoSocial }));
}

export function ProdutoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const produtoId = id && id !== 'novo' ? Number(id) : undefined;
  const ehEdicao = produtoId != null;
  const { data: produto, isLoading } = useProduto(produtoId);

  const form = useForm<ProdutoForm>({ resolver: zodResolver(produtoSchema), defaultValues: VAZIO });
  const { control, handleSubmit, reset, formState } = form;

  useEffect(() => {
    if (produto) reset(dtoParaForm(produto));
  }, [produto, reset]);

  const grupoId = useWatch({ control, name: 'grupoId' });
  const controlaLote = useWatch({ control, name: 'controlaLote' });

  const salvar = useSalvarProduto(produtoId, {
    aoSalvar: (idSalvo) => navigate(`/produtos/${idSalvo}`, { replace: true }),
  });

  const abaComErro = (campos: (keyof ProdutoForm)[]) =>
    campos.some((c) => c in formState.errors);

  const submeter = handleSubmit((v) =>
    salvar.mutate(formParaDados(v), {
      onError: (erro) => aplicarErrosDeCampo<ProdutoForm>(erro, form.setError),
    }),
  );

  const abas = useMemo(
    () => [
      {
        chave: 'gerais',
        titulo: 'Dados gerais',
        temErro: abaComErro(['descricao', 'descricaoEtiqueta', 'codigoBarras', 'codigoBarras2', 'codigoReferencia']),
        conteudo: (
          <SectionCard titulo="Identificação">
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto control={control} name="descricao" label="Descrição" obrigatorio maxLength={120} />
              <CampoTexto control={control} name="descricaoEtiqueta" label="Descrição para etiqueta" />
              <CampoTexto control={control} name="codigoBarras" label="Código de barras" mono />
              <CampoTexto control={control} name="codigoBarras2" label="Código de barras 2" mono />
              <CampoTexto control={control} name="codigoReferencia" label="Código de referência" />
            </div>
          </SectionCard>
        ),
      },
      {
        chave: 'classificacao',
        titulo: 'Classificação',
        temErro: abaComErro(['departamentoId', 'grupoId', 'unidadeEstoqueId']),
        conteudo: (
          <SectionCard titulo="Classificação">
            <div className="grid gap-4 sm:grid-cols-2">
              <CamposApoioProduto
                control={control}
                grupoSelecionado={grupoId as number | undefined}
                nomes={{
                  departamento: 'departamentoId',
                  grupo: 'grupoId',
                  subgrupo: 'subgrupoId',
                  marca: 'marcaId',
                  laboratorio: 'laboratorioId',
                  unidade: 'unidadeEstoqueId',
                }}
              />
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-600">
                  Fornecedor principal
                </span>
                <SelectAutocomplete
                  value={(form.watch('fornecedorPrincipalId') as number) ?? null}
                  onChange={(v) => form.setValue('fornecedorPrincipalId', (v as number) ?? null)}
                  buscar={buscarFornecedores}
                />
              </label>
              <CampoSelect
                control={control}
                name="tipoMedicamento"
                label="Tipo de medicamento"
                obrigatorio
                options={opcoesDe(rotulosTipoMedicamento)}
              />
            </div>
          </SectionCard>
        ),
      },
      {
        chave: 'estoque',
        titulo: 'Estoque',
        temErro: abaComErro(['quantidadePorEmbalagem', 'validadeMinimaDias']),
        conteudo: (
          <SectionCard
            titulo="Estoque"
            descricao="Unidades alternativas são definidas na tela de detalhe do produto."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoNumero control={control} name="quantidadePorEmbalagem" label="Quantidade por embalagem" obrigatorio min={0} precisao={3} />
              <CampoNumero control={control} name="estoqueMinimo" label="Estoque mínimo" min={0} precisao={3} />
              <CampoNumero control={control} name="estoqueMaximo" label="Estoque máximo" min={0} precisao={3} />
              <CampoNumero
                control={control}
                name="validadeMinimaDias"
                label="Validade mínima (dias)"
                min={1}
                disabled={!controlaLote}
                ajuda={!controlaLote ? 'Disponível quando "Controla lote" está ativo' : undefined}
              />
            </div>
            <div className="mt-4 flex flex-col gap-1 border-t border-neutral-100 pt-3">
              <CampoSwitch control={control} name="controlaLote" label="Controla lote" />
              <CampoSwitch control={control} name="controlaSerie" label="Controla série" />
              <CampoSwitch
                control={control}
                name="consideraEstoqueInteiro"
                label="Considera estoque inteiro"
                ajuda="Impede saldo fracionado mesmo com unidade fracionável."
              />
            </div>
          </SectionCard>
        ),
      },
      {
        chave: 'precos',
        titulo: 'Preços',
        temErro: abaComErro(['precoCusto', 'precoVenda']),
        conteudo: (
          <SectionCard titulo="Preços">
            {ehEdicao && (
              <Alert
                className="mb-4"
                type="info"
                showIcon
                title="Para alterar preços de um produto já cadastrado, use a ação “Definir preços” na tela de detalhe."
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoMoeda control={control} name="precoCusto" label="Preço de custo" obrigatorio disabled={ehEdicao} />
              <CampoMoeda control={control} name="precoVenda" label="Preço de venda" obrigatorio disabled={ehEdicao} />
              <CampoNumero control={control} name="margemPadrao" label="Margem padrão (%)" min={0} disabled={ehEdicao} sufixo="%" />
              <CampoNumero control={control} name="percentualComissao" label="Comissão (%)" min={0} disabled={ehEdicao} sufixo="%" />
              {ehEdicao && produto && (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-neutral-600">Custo médio</span>
                  <div className="mono rounded-md bg-neutral-50 px-3 py-1.5 text-neutral-700">
                    {produto.custoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="mt-1 block text-xs text-neutral-500">
                    Calculado a partir das entradas (ativo com o módulo de Compras).
                  </span>
                </label>
              )}
            </div>
          </SectionCard>
        ),
      },
      {
        chave: 'regulatorio',
        titulo: 'Regulatório',
        conteudo: (
          <SectionCard titulo="Regulatório">
            <Alert
              className="mb-4"
              type="info"
              showIcon
              title="Produtos controlados terão exigências adicionais de venda quando o módulo de Vendas existir. O cadastro já captura esses dados."
            />
            <div className="flex flex-col gap-1">
              <CampoSwitch control={control} name="controlado" label="Controlado" />
              <CampoSwitch control={control} name="monitoradoSngpc" label="Monitorado SNGPC" />
              <CampoSwitch control={control} name="exigeReceita" label="Exige receita" />
              <CampoSwitch
                control={control}
                name="bloqueiaVendaSeRegistroVencido"
                label="Bloqueia venda se registro MS vencido"
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <CampoTexto control={control} name="registroMs" label="Registro MS" />
              <CampoData control={control} name="validadeRegistroMsUtc" label="Validade do registro MS" />
              <CampoTexto control={control} name="principioAtivo" label="Princípio ativo" />
              <CampoTexto control={control} name="dcb" label="DCB" />
            </div>
          </SectionCard>
        ),
      },
      {
        chave: 'fiscal',
        titulo: 'Fiscal',
        temErro: abaComErro(['ncm']),
        conteudo: (
          <SectionCard titulo="Fiscal">
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto control={control} name="ncm" label="NCM" mono maxLength={8} placeholder="8 dígitos" />
              <CampoTexto control={control} name="cest" label="CEST" mono />
              <CampoSelect
                control={control}
                name="origemMercadoria"
                label="Origem da mercadoria"
                obrigatorio
                options={opcoesDe(rotulosOrigemMercadoria)}
                className="sm:col-span-2"
              />
            </div>
          </SectionCard>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [control, grupoId, controlaLote, ehEdicao, produto, formState.errors],
  );

  if (ehEdicao && isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <FormPage
      titulo={ehEdicao ? 'Editar produto' : 'Novo produto'}
      voltarPara={ehEdicao ? `/produtos/${produtoId}` : '/produtos'}
      salvando={salvar.isPending}
      abas={abas}
      aoSalvar={submeter}
    />
  );
}
