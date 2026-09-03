import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Skeleton } from 'antd';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoSwitch } from '@/compartilhado/ui/campos';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { RequerPermissao } from '@/compartilhado/auth/RequerPermissao';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { aplicarErrosDeCampo } from '@/compartilhado/api/errosDeFormulario';
import { CamposDadosParceiro } from '../componentes/CamposDadosParceiro';
import { representanteSchema, type RepresentanteForm } from '../validacao';
import { formParaDadosParceiro, dtoParaFormParceiro } from '../mapeadores';
import {
  useInativarRepresentante,
  useRepresentante,
  useSalvarRepresentante,
} from '../hooks/useParceiros';

const VAZIO: RepresentanteForm = {
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
  habilitadoAssinarLicitacao: false,
};

export function RepresentanteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const repId = id && id !== 'novo' ? Number(id) : undefined;
  const ehEdicao = repId != null;
  const { data: rep, isLoading } = useRepresentante(repId);

  const [inativando, setInativando] = useState(false);
  const form = useForm<RepresentanteForm>({
    resolver: zodResolver(representanteSchema),
    defaultValues: VAZIO,
  });
  const { control, handleSubmit, reset, setError } = form;

  useEffect(() => {
    if (rep)
      reset({
        ...VAZIO,
        ...dtoParaFormParceiro(rep),
        habilitadoAssinarLicitacao: rep.habilitadoAssinarLicitacao,
      });
  }, [rep, reset]);

  const ehFisica = useWatch({ control, name: 'tipoPessoa' }) === 'Fisica';

  const salvar = useSalvarRepresentante(repId, {
    aoSalvar: () => navigate('/representantes', { replace: true }),
  });
  const inativar = useInativarRepresentante(repId ?? 0);

  if (ehEdicao && isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <>
      {ehEdicao && rep && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <StatusTag variante={rep.ativo ? 'ativo' : 'inativo'} />
          {rep.ativo && (
            <RequerPermissao chave={Permissoes.FornecedoresGerenciar}>
              <Button danger onClick={() => setInativando(true)}>
                Inativar
              </Button>
            </RequerPermissao>
          )}
        </div>
      )}

      <FormPage
        titulo={ehEdicao ? 'Editar representante' : 'Novo representante'}
        voltarPara="/representantes"
        salvando={salvar.isPending}
        aoSalvar={handleSubmit((v) =>
          salvar.mutate(
            {
              dados: formParaDadosParceiro(v),
              habilitadoAssinarLicitacao: !!v.habilitadoAssinarLicitacao,
            },
            { onError: (erro) => aplicarErrosDeCampo<RepresentanteForm>(erro, setError) },
          ),
        )}
      >
        <CamposDadosParceiro control={control} ehFisica={ehFisica} />
        <SectionCard titulo="Licitações">
          <CampoSwitch
            control={control}
            name="habilitadoAssinarLicitacao"
            label="Habilitado a assinar licitação"
            ajuda="Fará sentido pleno quando o módulo de Licitações existir; já é capturado agora."
          />
        </SectionCard>
      </FormPage>

      <ConfirmDialog
        aberto={inativando}
        titulo="Inativar este representante?"
        descricao="Representante não tem reativação exposta pela API — a ação é irreversível por ora."
        rotuloConfirmar="Inativar"
        perigo
        carregando={inativar.isPending}
        aoConfirmar={() =>
          inativar.mutate(undefined, { onSuccess: () => navigate('/representantes') })
        }
        aoCancelar={() => setInativando(false)}
      />
    </>
  );
}
