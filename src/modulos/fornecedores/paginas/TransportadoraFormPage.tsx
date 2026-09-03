import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoSelect } from '@/compartilhado/ui/campos';
import { aplicarErrosDeCampo } from '@/compartilhado/api/errosDeFormulario';
import { opcoesDe, rotulosTipoFrete } from '@/compartilhado/utils/rotulosEnum';
import { CamposDadosParceiro } from '../componentes/CamposDadosParceiro';
import { transportadoraSchema, type TransportadoraForm } from '../validacao';
import { formParaDadosParceiro, dtoParaFormParceiro } from '../mapeadores';
import { useSalvarTransportadora, useTransportadora } from '../hooks/useParceiros';

const VAZIO: TransportadoraForm = {
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
  registroAntt: '',
  tipoFretePadrao: 'Cif',
};

export function TransportadoraFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const transpId = id && id !== 'novo' ? Number(id) : undefined;
  const ehEdicao = transpId != null;
  const { data: transp, isLoading } = useTransportadora(transpId);

  const form = useForm<TransportadoraForm>({
    resolver: zodResolver(transportadoraSchema),
    defaultValues: VAZIO,
  });
  const { control, handleSubmit, reset, setError } = form;

  useEffect(() => {
    if (transp)
      reset({
        ...VAZIO,
        ...dtoParaFormParceiro(transp),
        registroAntt: transp.registroAntt ?? '',
        tipoFretePadrao: (transp.tipoFretePadrao as 'Cif' | 'Fob') ?? 'Cif',
      });
  }, [transp, reset]);

  const ehFisica = useWatch({ control, name: 'tipoPessoa' }) === 'Fisica';

  const salvar = useSalvarTransportadora(transpId, {
    aoSalvar: (idSalvo) => navigate(`/transportadoras/${idSalvo}`, { replace: true }),
  });

  if (ehEdicao && isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <FormPage
      titulo={ehEdicao ? 'Editar transportadora' : 'Nova transportadora'}
      voltarPara={ehEdicao ? `/transportadoras/${transpId}` : '/transportadoras'}
      salvando={salvar.isPending}
      aoSalvar={handleSubmit((v) =>
        salvar.mutate(
          {
            dados: formParaDadosParceiro(v),
            registroAntt: v.registroAntt || null,
            tipoFretePadrao: v.tipoFretePadrao,
          },
          { onError: (erro) => aplicarErrosDeCampo<TransportadoraForm>(erro, setError) },
        ),
      )}
    >
      <CamposDadosParceiro control={control} ehFisica={ehFisica} />
      <SectionCard titulo="Transporte">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto control={control} name="registroAntt" label="Registro ANTT" />
          <CampoSelect
            control={control}
            name="tipoFretePadrao"
            label="Tipo de frete padrão"
            options={opcoesDe(rotulosTipoFrete)}
          />
        </div>
      </SectionCard>
    </FormPage>
  );
}
