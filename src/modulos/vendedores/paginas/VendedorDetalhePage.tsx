import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Modal, Skeleton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DetailPage } from '@/compartilhado/ui/DetailPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { EmptyState } from '@/compartilhado/ui/EmptyState';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { DataHora } from '@/compartilhado/ui/DataHora';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoData, CampoMoeda } from '@/compartilhado/ui/campos';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { formatarMoeda } from '@/compartilhado/utils/formatarMoeda';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { debitoSchema, type DebitoForm } from '../validacao';
import {
  useDebitos,
  useDefinirMetas,
  useRegistrarDebito,
  useStatusVendedor,
  useVendedor,
} from '../hooks/useVendedores';
import { EditorMetas } from '../componentes/EditorMetas';

export function VendedorDetalhePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const vendId = Number(id);
  const valido = Number.isFinite(vendId);
  const { data: v, isLoading, isError } = useVendedor(valido ? vendId : undefined);
  const { data: debitos = [] } = useDebitos(valido ? vendId : undefined);

  const [confirmar, setConfirmar] = useState(false);
  const [debitoAberto, setDebitoAberto] = useState(false);

  const status = useStatusVendedor(vendId);
  const definirMetas = useDefinirMetas(vendId);
  const registrarDebito = useRegistrarDebito(vendId, { aoRegistrar: () => setDebitoAberto(false) });

  const debForm = useForm<DebitoForm>({
    resolver: zodResolver(debitoSchema),
    defaultValues: { competenciaUtc: null as unknown as string, valor: 0, motivo: '' },
  });

  if (isError) return <NaoEncontradoPage />;
  if (isLoading || !v) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      <DetailPage
        titulo={v.nome}
        statusTag={<StatusTag variante={v.ativo ? 'ativo' : 'inativo'} />}
        voltarPara="/vendedores"
        acoes={[
          {
            chave: 'editar',
            rotulo: 'Editar',
            permissao: Permissoes.VendedoresGerenciar,
            aoClicar: () => navigate(`/vendedores/${vendId}/editar`),
          },
          {
            chave: 'status',
            rotulo: v.ativo ? 'Inativar' : 'Reativar',
            perigo: v.ativo,
            permissao: Permissoes.VendedoresGerenciar,
            aoClicar: () => setConfirmar(true),
          },
        ]}
        secoes={[
          {
            chave: 'dados',
            titulo: 'Dados',
            conteudo: (
              <SectionCard titulo="Dados">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {[
                    ['CPF', v.cpf || '—'],
                    ['Email', v.email || '—'],
                    ['Telefone', v.telefone || '—'],
                    ['Interno', v.interno ? 'Sim' : 'Não'],
                    ['Externo', v.externo ? 'Sim' : 'Não'],
                    [
                      'Comissão',
                      v.recebeComissao
                        ? v.comissaoPorMargem
                          ? 'Por margem'
                          : `${v.comissaoPercentualFixo ?? 0}% fixo`
                        : 'Não recebe',
                    ],
                  ].map(([k, val]) => (
                    <div key={k}>
                      <dt className="text-xs text-neutral-500">{k}</dt>
                      <dd className="m-0 text-neutral-800">{val}</dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>
            ),
          },
          {
            chave: 'metas',
            titulo: 'Metas',
            conteudo: v.recebeComissao ? (
              <EditorMetas
                metasIniciais={v.metas ?? []}
                salvando={definirMetas.isPending}
                aoSalvar={(faixas) => definirMetas.mutate(faixas)}
              />
            ) : (
              <EmptyState
                titulo="Vendedor não recebe comissão"
                descricao="Ative 'Recebe comissão' na edição para definir faixas de meta."
              />
            ),
          },
          {
            chave: 'debitos',
            titulo: 'Débitos',
            conteudo: (
              <SectionCard
                titulo="Débitos"
                descricao="Registro histórico — somente inclusão."
                acoes={
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => {
                      debForm.reset({ competenciaUtc: null as unknown as string, valor: 0, motivo: '' });
                      setDebitoAberto(true);
                    }}
                  >
                    Registrar débito
                  </Button>
                }
              >
                {debitos.length === 0 ? (
                  <EmptyState titulo="Nenhum débito registrado" />
                ) : (
                  <div className="overflow-x-auto rounded-md border border-neutral-200">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 text-left text-neutral-600">
                        <tr>
                          <th className="px-3 py-2 font-medium">Competência</th>
                          <th className="px-3 py-2 font-medium">Valor</th>
                          <th className="px-3 py-2 font-medium">Motivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debitos.map((d) => (
                          <tr key={d.id} className="border-t border-neutral-100 text-neutral-600">
                            <td className="px-3 py-2">
                              <DataHora valorUtc={d.competenciaUtc} somenteData />
                            </td>
                            <td className="px-3 py-2 tabular-nums">{formatarMoeda(d.valor)}</td>
                            <td className="px-3 py-2">{d.motivo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            ),
          },
        ]}
      />

      <ConfirmDialog
        aberto={confirmar}
        titulo={v.ativo ? 'Inativar este vendedor?' : 'Reativar este vendedor?'}
        rotuloConfirmar={v.ativo ? 'Inativar' : 'Reativar'}
        perigo={v.ativo}
        carregando={status.isPending}
        aoConfirmar={() => status.mutate(!v.ativo, { onSuccess: () => setConfirmar(false) })}
        aoCancelar={() => setConfirmar(false)}
      />

      <Modal
        open={debitoAberto}
        title="Registrar débito"
        okText="Registrar"
        okButtonProps={{ loading: registrarDebito.isPending }}
        onOk={debForm.handleSubmit((d) =>
          registrarDebito.mutate({
            competenciaUtc: d.competenciaUtc,
            valor: d.valor,
            motivo: d.motivo.trim(),
          }),
        )}
        onCancel={() => setDebitoAberto(false)}
        destroyOnHidden
      >
        <div className="flex flex-col gap-3">
          <CampoData control={debForm.control} name="competenciaUtc" label="Competência" obrigatorio />
          <CampoMoeda control={debForm.control} name="valor" label="Valor" obrigatorio />
          <CampoTexto control={debForm.control} name="motivo" label="Motivo" obrigatorio maxLength={240} />
        </div>
      </Modal>
    </>
  );
}
