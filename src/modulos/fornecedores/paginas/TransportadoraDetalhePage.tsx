import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import { DetailPage } from '@/compartilhado/ui/DetailPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { formatarCpfCnpj } from '@/compartilhado/utils/cpfCnpj';
import { rotular, rotulosTipoFrete } from '@/compartilhado/utils/rotulosEnum';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { useStatusTransportadora, useTransportadora } from '../hooks/useParceiros';

export function TransportadoraDetalhePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const tId = Number(id);
  const { data: t, isLoading, isError } = useTransportadora(Number.isFinite(tId) ? tId : undefined);
  const status = useStatusTransportadora(tId);
  const [confirmar, setConfirmar] = useState(false);

  if (isError) return <NaoEncontradoPage />;
  if (isLoading || !t) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      <DetailPage
        titulo={t.razaoSocial}
        subtitulo={<span className="mono">{formatarCpfCnpj(t.cpfCnpj)}</span>}
        statusTag={<StatusTag variante={t.ativo ? 'ativo' : 'inativo'} />}
        voltarPara="/transportadoras"
        acoes={[
          {
            chave: 'editar',
            rotulo: 'Editar',
            permissao: Permissoes.FornecedoresGerenciar,
            aoClicar: () => navigate(`/transportadoras/${tId}/editar`),
          },
          {
            chave: 'status',
            rotulo: t.ativo ? 'Inativar' : 'Reativar',
            perigo: t.ativo,
            permissao: Permissoes.FornecedoresGerenciar,
            aoClicar: () => setConfirmar(true),
          },
        ]}
      >
        <SectionCard titulo="Identificação">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-neutral-500">Nome Fantasia</dt>
              <dd className="m-0 text-neutral-800">{t.nomeFantasia || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Email</dt>
              <dd className="m-0 text-neutral-800">{t.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Registro ANTT</dt>
              <dd className="m-0 text-neutral-800">{t.registroAntt || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Tipo de frete padrão</dt>
              <dd className="m-0 text-neutral-800">{rotular(rotulosTipoFrete, t.tipoFretePadrao)}</dd>
            </div>
          </dl>
        </SectionCard>
      </DetailPage>

      <ConfirmDialog
        aberto={confirmar}
        titulo={t.ativo ? 'Inativar esta transportadora?' : 'Reativar esta transportadora?'}
        rotuloConfirmar={t.ativo ? 'Inativar' : 'Reativar'}
        perigo={t.ativo}
        carregando={status.isPending}
        aoConfirmar={() => status.mutate(!t.ativo, { onSuccess: () => setConfirmar(false) })}
        aoCancelar={() => setConfirmar(false)}
      />
    </>
  );
}
