import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoNumero, CampoSelect, CampoSwitch } from '@/compartilhado/ui/campos';
import { aplicarErrosDeCampo } from '@/compartilhado/api/errosDeFormulario';
import { opcoesDe, rotulosTipoFrete } from '@/compartilhado/utils/rotulosEnum';
import { CamposDadosParceiro } from '../componentes/CamposDadosParceiro';
import { fornecedorSchema, type FornecedorForm } from '../validacao';
import { formParaDadosParceiro, dtoParaFormParceiro } from '../mapeadores';
import { useFornecedor, useSalvarFornecedor } from '../hooks/useParceiros';

const VAZIO: FornecedorForm = {
  tipoPessoa: 'Juridica',
  cpfCnpj: '',
  inscricaoEstadualRg: '',
  razaoSocial: '',
  nomeFantasia: '',
  ramo: '',
  segmentoId: null,
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidadeId: null,
  email: '',
  telefone: '',
  alvara: '',
  validadeAlvaraUtc: null,
  responsavelTecnico: '',
  registroConselho: '',
  prazoEntregaDias: 0,
  tipoFrete: 'Cif',
  participaCotacaoFrete: false,
  condicaoPagamentoPadrao: '',
};

export function FornecedorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fornId = id && id !== 'novo' ? Number(id) : undefined;
  const ehEdicao = fornId != null;
  const { data: forn, isLoading } = useFornecedor(fornId);

  const form = useForm<FornecedorForm>({ resolver: zodResolver(fornecedorSchema), defaultValues: VAZIO });
  const { control, handleSubmit, reset, setError } = form;

  useEffect(() => {
    if (forn)
      reset({
        ...VAZIO,
        ...dtoParaFormParceiro(forn),
        prazoEntregaDias: forn.prazoEntregaDias ?? 0,
        tipoFrete: (forn.tipoFrete as 'Cif' | 'Fob') ?? 'Cif',
        participaCotacaoFrete: forn.participaCotacaoFrete,
        condicaoPagamentoPadrao: forn.condicaoPagamentoPadrao ?? '',
      });
  }, [forn, reset]);

  const ehFisica = useWatch({ control, name: 'tipoPessoa' }) === 'Fisica';

  const salvar = useSalvarFornecedor(fornId, {
    aoSalvar: (idSalvo) => navigate(`/fornecedores/${idSalvo}`, { replace: true }),
  });

  if (ehEdicao && isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <FormPage
      titulo={ehEdicao ? 'Editar fornecedor' : 'Novo fornecedor'}
      voltarPara={ehEdicao ? `/fornecedores/${fornId}` : '/fornecedores'}
      salvando={salvar.isPending}
      aoSalvar={handleSubmit((v) =>
        salvar.mutate(
          {
            dados: formParaDadosParceiro(v),
            prazoEntregaDias: v.prazoEntregaDias ?? 0,
            tipoFrete: v.tipoFrete,
            participaCotacaoFrete: !!v.participaCotacaoFrete,
            condicaoPagamentoPadrao: v.condicaoPagamentoPadrao || null,
          },
          { onError: (erro) => aplicarErrosDeCampo<FornecedorForm>(erro, setError) },
        ),
      )}
    >
      <CamposDadosParceiro control={control} ehFisica={ehFisica} />
      <SectionCard titulo="Comercial">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoNumero control={control} name="prazoEntregaDias" label="Prazo de entrega (dias)" min={0} />
          <CampoSelect
            control={control}
            name="tipoFrete"
            label="Tipo de frete"
            options={opcoesDe(rotulosTipoFrete)}
          />
          <CampoTexto
            control={control}
            name="condicaoPagamentoPadrao"
            label="Condição de pagamento padrão"
          />
        </div>
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <CampoSwitch control={control} name="participaCotacaoFrete" label="Participa de cotação de frete" />
        </div>
      </SectionCard>
    </FormPage>
  );
}
