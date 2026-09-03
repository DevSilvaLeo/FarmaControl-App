import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Radio, Skeleton } from 'antd';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoData, CampoMoeda, CampoNumero, CampoSelect, CampoSwitch } from '@/compartilhado/ui/campos';
import { aplicarErrosDeCampo } from '@/compartilhado/api/errosDeFormulario';
import { formatarCnpj, formatarCpf, apenasDigitos } from '@/compartilhado/utils/cpfCnpj';
import { CampoEndereco } from '@/modulos/geografia/componentes/CampoEndereco';
import { clienteSchema, type ClienteForm } from '../validacao';
import { useCliente, useSalvarCliente, useSegmentos } from '../hooks/useClientes';
import { GerenciarSegmentosModal } from '../componentes/GerenciarSegmentosModal';
import type { ClienteDto, DadosCliente } from '../tipos';

const VAZIO: ClienteForm = {
  tipoPessoa: 'Juridica',
  cpfCnpj: '',
  inscricaoEstadualRg: '',
  razaoSocial: '',
  nomeFantasia: '',
  ramo: '',
  simplesNacional: false,
  orgaoPublico: false,
  nascimentoUtc: null,
  segmentoId: null,
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidadeId: null,
  email: '',
  emailFinanceiro: '',
  telefone: '',
  prazoMedioDias: null,
  limiteCredito: 0,
  operaSomenteAVista: false,
  descontoPadrao: null,
  alvara: '',
  validadeAlvaraUtc: null,
  responsavelTecnico: '',
  registroConselho: '',
  validadeMinimaProdutoDias: null,
  retemPis: false,
  retemCofins: false,
  retemIr: false,
  retemCsll: false,
  retemInss: false,
  obsEntrega: '',
  obsFaturamento: '',
  obsAlmoxarifado: '',
  obsNotaFiscal: '',
  obsGeral: '',
};

function dtoParaForm(c: ClienteDto): ClienteForm {
  const s = (v: string | null | undefined) => v ?? '';
  return {
    ...VAZIO,
    tipoPessoa: c.tipoPessoa === 'Fisica' ? 'Fisica' : 'Juridica',
    cpfCnpj: c.cpfCnpj,
    inscricaoEstadualRg: s(c.inscricaoEstadualRg),
    razaoSocial: c.razaoSocial,
    nomeFantasia: s(c.nomeFantasia),
    ramo: s(c.ramo),
    simplesNacional: c.simplesNacional,
    orgaoPublico: c.orgaoPublico,
    nascimentoUtc: c.nascimentoUtc ?? null,
    segmentoId: c.segmentoId ?? null,
    cep: s(c.cep),
    logradouro: s(c.logradouro),
    numero: s(c.numero),
    complemento: s(c.complemento),
    bairro: s(c.bairro),
    cidadeId: c.cidadeId ?? null,
    email: s(c.email),
    emailFinanceiro: s(c.emailFinanceiro),
    telefone: s(c.telefone),
    prazoMedioDias: c.prazoMedioDias ?? null,
    limiteCredito: c.limiteCredito,
    operaSomenteAVista: c.operaSomenteAVista,
    descontoPadrao: c.descontoPadrao ?? null,
    alvara: s(c.alvara),
    validadeAlvaraUtc: c.validadeAlvaraUtc ?? null,
    responsavelTecnico: s(c.responsavelTecnico),
    registroConselho: s(c.registroConselho),
    validadeMinimaProdutoDias: c.validadeMinimaProdutoDias ?? null,
    retemPis: c.retemPis,
    retemCofins: c.retemCofins,
    retemIr: c.retemIr,
    retemCsll: c.retemCsll,
    retemInss: c.retemInss,
    obsEntrega: s(c.obsEntrega),
    obsFaturamento: s(c.obsFaturamento),
    obsAlmoxarifado: s(c.obsAlmoxarifado),
    obsNotaFiscal: s(c.obsNotaFiscal),
    obsGeral: s(c.obsGeral),
  };
}

const nn = (v?: string | null) => (v && v.trim() !== '' ? v.trim() : null);

function formParaDados(f: ClienteForm): DadosCliente {
  return {
    tipoPessoa: f.tipoPessoa,
    cpfCnpjDigitos: apenasDigitos(f.cpfCnpj),
    inscricaoEstadualRg: nn(f.inscricaoEstadualRg),
    razaoSocial: f.razaoSocial.trim(),
    nomeFantasia: nn(f.nomeFantasia),
    ramo: nn(f.ramo),
    simplesNacional: f.tipoPessoa === 'Juridica' ? !!f.simplesNacional : false,
    orgaoPublico: !!f.orgaoPublico,
    nascimentoUtc: f.tipoPessoa === 'Fisica' ? (f.nascimentoUtc ?? null) : null,
    segmentoId: f.segmentoId ?? null,
    cep: nn(f.cep),
    logradouro: nn(f.logradouro),
    numero: nn(f.numero),
    complemento: nn(f.complemento),
    bairro: nn(f.bairro),
    cidadeId: f.cidadeId ?? null,
    email: nn(f.email),
    emailFinanceiro: nn(f.emailFinanceiro),
    telefone: nn(f.telefone),
    prazoMedioDias: f.prazoMedioDias ?? null,
    limiteCredito: f.limiteCredito ?? 0,
    operaSomenteAVista: !!f.operaSomenteAVista,
    descontoPadrao: f.descontoPadrao ?? null,
    alvara: nn(f.alvara),
    validadeAlvaraUtc: f.validadeAlvaraUtc ?? null,
    responsavelTecnico: nn(f.responsavelTecnico),
    registroConselho: nn(f.registroConselho),
    validadeMinimaProdutoDias: f.validadeMinimaProdutoDias ?? null,
    retemPis: !!f.retemPis,
    retemCofins: !!f.retemCofins,
    retemIr: !!f.retemIr,
    retemCsll: !!f.retemCsll,
    retemInss: !!f.retemInss,
    obsEntrega: nn(f.obsEntrega),
    obsFaturamento: nn(f.obsFaturamento),
    obsAlmoxarifado: nn(f.obsAlmoxarifado),
    obsNotaFiscal: nn(f.obsNotaFiscal),
    obsGeral: nn(f.obsGeral),
  };
}

export function ClienteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const clienteId = id && id !== 'novo' ? Number(id) : undefined;
  const ehEdicao = clienteId != null;
  const { data: cliente, isLoading } = useCliente(clienteId);
  const { data: segmentos = [] } = useSegmentos();

  const [gerenciarSegmentos, setGerenciarSegmentos] = useState(false);

  const form = useForm<ClienteForm>({ resolver: zodResolver(clienteSchema), defaultValues: VAZIO });
  const { control, handleSubmit, reset, setError, formState } = form;

  useEffect(() => {
    if (cliente) reset(dtoParaForm(cliente));
  }, [cliente, reset]);

  const tipoPessoa = useWatch({ control, name: 'tipoPessoa' });
  const ehFisica = tipoPessoa === 'Fisica';

  const salvar = useSalvarCliente(clienteId, {
    aoSalvar: (idSalvo) => navigate(`/clientes/${idSalvo}`, { replace: true }),
  });

  const submeter = handleSubmit((v) =>
    salvar.mutate(formParaDados(v), {
      onError: (erro) => aplicarErrosDeCampo<ClienteForm>(erro, setError),
    }),
  );

  const temErro = (campos: (keyof ClienteForm)[]) => campos.some((c) => c in formState.errors);

  const abas = useMemo(
    () => [
      {
        chave: 'gerais',
        titulo: 'Dados gerais',
        temErro: temErro(['cpfCnpj', 'razaoSocial', 'email', 'emailFinanceiro']),
        conteudo: (
          <div className="flex flex-col gap-6">
            <SectionCard titulo="Identificação">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="tipoPessoa"
                  render={({ field }) => (
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-sm font-medium text-neutral-600">Tipo de pessoa *</span>
                      <Radio.Group
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        options={[
                          { label: 'Jurídica', value: 'Juridica' },
                          { label: 'Física', value: 'Fisica' },
                        ]}
                        optionType="button"
                      />
                    </label>
                  )}
                />
                <Controller
                  control={control}
                  name="cpfCnpj"
                  render={({ field, fieldState }) => (
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-neutral-600">
                        {ehFisica ? 'CPF' : 'CNPJ'} <span className="text-erro">*</span>
                      </span>
                      <input
                        className={`mono w-full rounded-md border px-3 py-1.5 text-sm ${
                          fieldState.error ? 'border-erro' : 'border-neutral-300'
                        }`}
                        inputMode="numeric"
                        placeholder={ehFisica ? '000.000.000-00' : '00.000.000/0000-00'}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            ehFisica ? formatarCpf(e.target.value) : formatarCnpj(e.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                      />
                      {fieldState.error && (
                        <span className="mt-1 block text-xs text-erro">{fieldState.error.message}</span>
                      )}
                    </label>
                  )}
                />
                <CampoTexto
                  control={control}
                  name="inscricaoEstadualRg"
                  label={ehFisica ? 'RG' : 'Inscrição Estadual'}
                />
                <CampoTexto
                  control={control}
                  name="razaoSocial"
                  label={ehFisica ? 'Nome completo' : 'Razão Social'}
                  obrigatorio
                  maxLength={120}
                />
                <CampoTexto control={control} name="nomeFantasia" label="Nome Fantasia" />
                <CampoTexto control={control} name="ramo" label="Ramo de atividade" />
                {!ehFisica && (
                  <CampoSwitch control={control} name="simplesNacional" label="Optante pelo Simples Nacional" />
                )}
                {ehFisica && (
                  <CampoData control={control} name="nascimentoUtc" label="Data de nascimento" />
                )}
                <CampoSwitch
                  control={control}
                  name="orgaoPublico"
                  label="Órgão público"
                  ajuda="Usado em relatórios e no módulo de Licitações."
                />
                <CampoSelect
                  control={control}
                  name="segmentoId"
                  label="Segmento"
                  options={segmentos.map((s) => ({ value: s.id, label: s.nome }))}
                  aoLado={
                    <Button
                      type="link"
                      size="small"
                      className="h-auto p-0"
                      onClick={() => setGerenciarSegmentos(true)}
                    >
                      Gerenciar
                    </Button>
                  }
                />
              </div>
            </SectionCard>

            <SectionCard titulo="Endereço principal">
              <CampoEndereco
                control={control}
                nomes={{
                  cep: 'cep',
                  logradouro: 'logradouro',
                  numero: 'numero',
                  complemento: 'complemento',
                  bairro: 'bairro',
                  cidadeId: 'cidadeId',
                }}
              />
            </SectionCard>

            <SectionCard titulo="Contato principal">
              <div className="grid gap-4 sm:grid-cols-3">
                <CampoTexto control={control} name="email" label="Email" tipo="email" />
                <CampoTexto control={control} name="emailFinanceiro" label="Email financeiro" tipo="email" />
                <CampoTexto control={control} name="telefone" label="Telefone" />
              </div>
            </SectionCard>
          </div>
        ),
      },
      {
        chave: 'enderecos',
        titulo: 'Endereços',
        conteudo: (
          <Alert
            type="info"
            showIcon
            title="Endereços de entrega e cobrança são gerenciados na tela de detalhe do cliente (após salvar)."
          />
        ),
      },
      {
        chave: 'contatos',
        titulo: 'Contatos',
        conteudo: (
          <Alert
            type="info"
            showIcon
            title="Contatos adicionais são gerenciados na tela de detalhe do cliente (após salvar)."
          />
        ),
      },
      {
        chave: 'financeiro',
        titulo: 'Financeiro e crédito',
        temErro: temErro(['limiteCredito', 'prazoMedioDias']),
        conteudo: (
          <SectionCard titulo="Financeiro e crédito">
            {ehEdicao && (
              <Alert
                className="mb-4"
                type="info"
                showIcon
                title="O limite de crédito de um cliente já cadastrado é alterado pela ação “Alterar limite” na tela de detalhe."
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoNumero control={control} name="prazoMedioDias" label="Prazo médio (dias)" min={0} />
              <CampoMoeda
                control={control}
                name="limiteCredito"
                label="Limite de crédito"
                disabled={ehEdicao}
              />
              <CampoNumero control={control} name="descontoPadrao" label="Desconto padrão (%)" min={0} sufixo="%" />
            </div>
            <div className="mt-3 border-t border-neutral-100 pt-3">
              <CampoSwitch control={control} name="operaSomenteAVista" label="Opera somente à vista" />
            </div>
          </SectionCard>
        ),
      },
      {
        chave: 'fiscal',
        titulo: 'Fiscal e regulatório',
        conteudo: (
          <div className="flex flex-col gap-6">
            <SectionCard titulo="Regulatório">
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoTexto control={control} name="alvara" label="Alvará" />
                <CampoData control={control} name="validadeAlvaraUtc" label="Validade do alvará" />
                <CampoTexto control={control} name="responsavelTecnico" label="Responsável técnico" />
                <CampoTexto control={control} name="registroConselho" label="Registro no conselho" />
                <CampoNumero
                  control={control}
                  name="validadeMinimaProdutoDias"
                  label="Validade mínima de produto (dias)"
                  min={0}
                  ajuda="Rejeita produto com validade menor que X dias na entrega a este cliente."
                />
              </div>
            </SectionCard>

            <SectionCard titulo="Retenções">
              <div className="flex flex-col gap-1">
                <CampoSwitch control={control} name="retemPis" label="Retém PIS" />
                <CampoSwitch control={control} name="retemCofins" label="Retém COFINS" />
                <CampoSwitch control={control} name="retemIr" label="Retém IR" />
                <CampoSwitch control={control} name="retemCsll" label="Retém CSLL" />
                <CampoSwitch control={control} name="retemInss" label="Retém INSS" />
              </div>
            </SectionCard>

            <SectionCard
              titulo="Observações"
              descricao="Instruções operacionais impressas em documentos de separação/entrega."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoTexto control={control} name="obsEntrega" label="Entrega" tipo="textarea" rows={2} />
                <CampoTexto control={control} name="obsFaturamento" label="Faturamento" tipo="textarea" rows={2} />
                <CampoTexto control={control} name="obsAlmoxarifado" label="Almoxarifado" tipo="textarea" rows={2} />
                <CampoTexto control={control} name="obsNotaFiscal" label="Nota fiscal" tipo="textarea" rows={2} />
                <CampoTexto
                  control={control}
                  name="obsGeral"
                  label="Geral"
                  tipo="textarea"
                  rows={2}
                  className="sm:col-span-2"
                />
              </div>
            </SectionCard>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [control, ehFisica, ehEdicao, segmentos, formState.errors],
  );

  if (ehEdicao && isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <>
      <FormPage
        titulo={ehEdicao ? 'Editar cliente' : 'Novo cliente'}
        voltarPara={ehEdicao ? `/clientes/${clienteId}` : '/clientes'}
        salvando={salvar.isPending}
        abas={abas}
        aoSalvar={submeter}
      />
      <GerenciarSegmentosModal aberto={gerenciarSegmentos} aoFechar={() => setGerenciarSegmentos(false)} />
    </>
  );
}
