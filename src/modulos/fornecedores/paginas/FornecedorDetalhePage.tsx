import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import { DetailPage } from '@/compartilhado/ui/DetailPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { SemaforoValidade } from '@/compartilhado/ui/SemaforoValidade';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { formatarCpfCnpj } from '@/compartilhado/utils/cpfCnpj';
import { formatarData } from '@/compartilhado/utils/datas';
import { rotular, rotulosTipoFrete } from '@/compartilhado/utils/rotulosEnum';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { useFornecedor, useStatusFornecedor } from '../hooks/useParceiros';

function Campo({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-neutral-500">{k}</dt>
      <dd className="m-0 text-neutral-800">{v}</dd>
    </div>
  );
}

export function FornecedorDetalhePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fornId = Number(id);
  const { data: f, isLoading, isError } = useFornecedor(Number.isFinite(fornId) ? fornId : undefined);
  const status = useStatusFornecedor(fornId);
  const [confirmar, setConfirmar] = useState(false);

  if (isError) return <NaoEncontradoPage />;
  if (isLoading || !f) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      <DetailPage
        titulo={f.razaoSocial}
        subtitulo={<span className="mono">{formatarCpfCnpj(f.cpfCnpj)}</span>}
        statusTag={<StatusTag variante={f.ativo ? 'ativo' : 'inativo'} />}
        voltarPara="/fornecedores"
        acoes={[
          {
            chave: 'editar',
            rotulo: 'Editar',
            permissao: Permissoes.FornecedoresGerenciar,
            aoClicar: () => navigate(`/fornecedores/${fornId}/editar`),
          },
          {
            chave: 'status',
            rotulo: f.ativo ? 'Inativar' : 'Reativar',
            perigo: f.ativo,
            permissao: Permissoes.FornecedoresGerenciar,
            aoClicar: () => setConfirmar(true),
          },
        ]}
      >
        <SectionCard titulo="Identificação">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Campo k="Nome Fantasia" v={f.nomeFantasia || '—'} />
            <Campo k="Ramo" v={f.ramo || '—'} />
            <Campo k="Email" v={f.email || '—'} />
            <Campo k="Telefone" v={f.telefone || '—'} />
          </dl>
        </SectionCard>
        <SectionCard titulo="Comercial">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Campo k="Prazo de entrega" v={`${f.prazoEntregaDias} dias`} />
            <Campo k="Tipo de frete" v={rotular(rotulosTipoFrete, f.tipoFrete)} />
            <Campo k="Participa de cotação de frete" v={f.participaCotacaoFrete ? 'Sim' : 'Não'} />
            <Campo k="Condição de pagamento" v={f.condicaoPagamentoPadrao || '—'} />
          </dl>
        </SectionCard>
        <SectionCard titulo="Regulatório">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Campo
              k="Alvará"
              v={
                <span className="flex items-center gap-2">
                  {f.alvara || '—'}
                  {f.validadeAlvaraUtc && (
                    <>
                      <span className="text-xs text-neutral-500">
                        ({formatarData(f.validadeAlvaraUtc)})
                      </span>
                      <SemaforoValidade validadeUtc={f.validadeAlvaraUtc} />
                    </>
                  )}
                </span>
              }
            />
            <Campo k="Responsável técnico" v={f.responsavelTecnico || '—'} />
            <Campo k="Registro no conselho" v={f.registroConselho || '—'} />
          </dl>
        </SectionCard>
      </DetailPage>

      <ConfirmDialog
        aberto={confirmar}
        titulo={f.ativo ? 'Inativar este fornecedor?' : 'Reativar este fornecedor?'}
        rotuloConfirmar={f.ativo ? 'Inativar' : 'Reativar'}
        perigo={f.ativo}
        carregando={status.isPending}
        aoConfirmar={() => status.mutate(!f.ativo, { onSuccess: () => setConfirmar(false) })}
        aoCancelar={() => setConfirmar(false)}
      />
    </>
  );
}
