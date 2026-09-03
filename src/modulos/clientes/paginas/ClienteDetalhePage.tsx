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
import { SemaforoValidade } from '@/compartilhado/ui/SemaforoValidade';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoMoeda } from '@/compartilhado/ui/campos';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { formatarCpfCnpj } from '@/compartilhado/utils/cpfCnpj';
import { formatarMoeda } from '@/compartilhado/utils/formatarMoeda';
import { formatarData } from '@/compartilhado/utils/datas';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { contatoSchema, type ContatoForm } from '../validacao';
import {
  useAdicionarContato,
  useAlterarStatusCliente,
  useBloqueioCliente,
  useCliente,
  useDefinirLimiteCredito,
} from '../hooks/useClientes';
import { AdicionarEnderecoDrawer } from '../componentes/AdicionarEnderecoDrawer';
import type { EnderecoCobrancaDto, EnderecoEntregaDto } from '../tipos';

function EnderecoCard({ e }: { e: EnderecoEntregaDto | EnderecoCobrancaDto }) {
  return (
    <div className="rounded-md border border-neutral-200 p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-neutral-800">
          {'destinatario' in e && e.destinatario ? e.destinatario : 'Endereço'}
        </span>
        {e.ehPadrao && <StatusTag variante="padrao" />}
      </div>
      <div className="mt-1 text-neutral-600">
        {[e.logradouro, e.numero, e.complemento, e.bairro].filter(Boolean).join(', ') || '—'}
      </div>
      <div className="text-neutral-500">
        <span className="mono">{e.cep || 's/ CEP'}</span>
        {e.cidadeId ? ` · Cidade #${e.cidadeId}` : ''}
      </div>
    </div>
  );
}

export function ClienteDetalhePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const clienteId = Number(id);
  const valido = Number.isFinite(clienteId);
  const { data: c, isLoading, isError } = useCliente(valido ? clienteId : undefined);

  const [alterandoLimite, setAlterandoLimite] = useState(false);
  const [confirmarStatus, setConfirmarStatus] = useState(false);
  const [bloqueando, setBloqueando] = useState(false);
  const [contatoAberto, setContatoAberto] = useState(false);
  const [enderecoDrawer, setEnderecoDrawer] = useState<null | 'entrega' | 'cobranca'>(null);

  const limiteForm = useForm<{ limite: number }>({ defaultValues: { limite: 0 } });
  const contatoForm = useForm<ContatoForm>({
    resolver: zodResolver(contatoSchema),
    defaultValues: { nome: '', cargo: '', email: '', telefone: '' },
  });

  const definirLimite = useDefinirLimiteCredito(clienteId, { aoSalvar: () => setAlterandoLimite(false) });
  const status = useAlterarStatusCliente(clienteId);
  const bloqueio = useBloqueioCliente(clienteId);
  const adicionarContato = useAdicionarContato(clienteId, {
    aoAdicionar: () => {
      contatoForm.reset();
      setContatoAberto(false);
    },
  });

  if (isError) return <NaoEncontradoPage />;
  if (isLoading || !c) return <Skeleton active paragraph={{ rows: 8 }} />;

  const abrirLimite = () => {
    limiteForm.reset({ limite: c.limiteCredito });
    setAlterandoLimite(true);
  };

  return (
    <>
      <DetailPage
        titulo={c.razaoSocial}
        subtitulo={<span className="mono">{formatarCpfCnpj(c.cpfCnpj)}</span>}
        statusTag={
          <>
            {c.bloqueado && <StatusTag variante="bloqueado" />}
            <StatusTag variante={c.ativo ? 'ativo' : 'inativo'} />
          </>
        }
        voltarPara="/clientes"
        acoes={[
          {
            chave: 'editar',
            rotulo: 'Editar',
            permissao: Permissoes.ClientesGerenciar,
            aoClicar: () => navigate(`/clientes/${clienteId}/editar`),
          },
          {
            chave: 'limite',
            rotulo: 'Alterar limite',
            permissao: Permissoes.ClientesGerenciar,
            aoClicar: abrirLimite,
          },
          {
            chave: 'bloqueio',
            rotulo: c.bloqueado ? 'Desbloquear' : 'Bloquear',
            perigo: !c.bloqueado,
            permissao: Permissoes.ClientesGerenciar,
            aoClicar: () => (c.bloqueado ? bloqueio.desbloquear.mutate() : setBloqueando(true)),
          },
          {
            chave: 'status',
            rotulo: c.ativo ? 'Inativar' : 'Reativar',
            perigo: c.ativo,
            permissao: Permissoes.ClientesGerenciar,
            aoClicar: () => setConfirmarStatus(true),
          },
        ]}
        secoes={[
          {
            chave: 'dados',
            titulo: 'Dados',
            conteudo: (
              <SectionCard titulo="Dados gerais">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  {[
                    ['Nome Fantasia', c.nomeFantasia || '—'],
                    ['Tipo', c.tipoPessoa === 'Fisica' ? 'Pessoa física' : 'Pessoa jurídica'],
                    ['Ramo', c.ramo || '—'],
                    ['Email', c.email || '—'],
                    ['Telefone', c.telefone || '—'],
                    ['Órgão público', c.orgaoPublico ? 'Sim' : 'Não'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-neutral-500">{k}</dt>
                      <dd className="m-0 text-neutral-800">{v}</dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>
            ),
          },
          {
            chave: 'enderecos',
            titulo: 'Endereços',
            conteudo: (
              <div className="flex flex-col gap-4">
                <SectionCard
                  titulo="Endereços de entrega"
                  acoes={
                    <Button icon={<PlusOutlined />} onClick={() => setEnderecoDrawer('entrega')}>
                      Adicionar
                    </Button>
                  }
                >
                  {(c.enderecosEntrega ?? []).length === 0 ? (
                    <EmptyState titulo="Nenhum endereço de entrega" />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {c.enderecosEntrega!.map((e) => (
                        <EnderecoCard key={e.id} e={e} />
                      ))}
                    </div>
                  )}
                </SectionCard>
                <SectionCard
                  titulo="Endereços de cobrança"
                  acoes={
                    <Button icon={<PlusOutlined />} onClick={() => setEnderecoDrawer('cobranca')}>
                      Adicionar
                    </Button>
                  }
                >
                  {(c.enderecosCobranca ?? []).length === 0 ? (
                    <EmptyState titulo="Nenhum endereço de cobrança" />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {c.enderecosCobranca!.map((e) => (
                        <EnderecoCard key={e.id} e={e} />
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>
            ),
          },
          {
            chave: 'contatos',
            titulo: 'Contatos',
            conteudo: (
              <SectionCard
                titulo="Contatos adicionais"
                acoes={
                  <Button icon={<PlusOutlined />} onClick={() => setContatoAberto(true)}>
                    Adicionar contato
                  </Button>
                }
              >
                {(c.contatos ?? []).length === 0 ? (
                  <EmptyState titulo="Nenhum contato adicional" />
                ) : (
                  <div className="flex flex-col gap-2">
                    {c.contatos!.map((ct) => (
                      <div key={ct.id} className="rounded-md border border-neutral-200 p-3 text-sm">
                        <span className="font-medium text-neutral-800">{ct.nome}</span>
                        {ct.cargo && <span className="text-neutral-500"> · {ct.cargo}</span>}
                        <div className="text-neutral-600">
                          {[ct.email, ct.telefone].filter(Boolean).join(' · ') || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            ),
          },
          {
            chave: 'financeiro',
            titulo: 'Financeiro',
            conteudo: (
              <div className="flex flex-col gap-4">
                {c.bloqueado && (
                  <SectionCard titulo="Bloqueado" className="bg-erro-fundo">
                    <p className="m-0 text-sm text-neutral-700">
                      Motivo: {c.motivoBloqueio || '—'}
                    </p>
                  </SectionCard>
                )}
                <SectionCard titulo="Crédito e condições">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                    {[
                      ['Limite de crédito', formatarMoeda(c.limiteCredito)],
                      ['Prazo médio', c.prazoMedioDias != null ? `${c.prazoMedioDias} dias` : '—'],
                      ['Somente à vista', c.operaSomenteAVista ? 'Sim' : 'Não'],
                      ['Desconto padrão', c.descontoPadrao != null ? `${c.descontoPadrao}%` : '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-neutral-500">{k}</dt>
                        <dd className="m-0 text-neutral-800">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </SectionCard>
              </div>
            ),
          },
          {
            chave: 'fiscal',
            titulo: 'Fiscal',
            conteudo: (
              <SectionCard titulo="Fiscal e regulatório">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-neutral-500">Alvará</dt>
                    <dd className="m-0 flex items-center gap-2 text-neutral-800">
                      {c.alvara || '—'}
                      {c.validadeAlvaraUtc && (
                        <>
                          <span className="text-xs text-neutral-500">
                            ({formatarData(c.validadeAlvaraUtc)})
                          </span>
                          <SemaforoValidade validadeUtc={c.validadeAlvaraUtc} />
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Responsável técnico</dt>
                    <dd className="m-0 text-neutral-800">{c.responsavelTecnico || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Retenções</dt>
                    <dd className="m-0 text-neutral-800">
                      {[
                        c.retemPis && 'PIS',
                        c.retemCofins && 'COFINS',
                        c.retemIr && 'IR',
                        c.retemCsll && 'CSLL',
                        c.retemInss && 'INSS',
                      ]
                        .filter(Boolean)
                        .join(', ') || 'Nenhuma'}
                    </dd>
                  </div>
                </dl>
              </SectionCard>
            ),
          },
        ]}
      />

      <Modal
        open={alterandoLimite}
        title="Alterar limite de crédito"
        okText="Salvar"
        okButtonProps={{ loading: definirLimite.isPending }}
        onOk={limiteForm.handleSubmit((v) => definirLimite.mutate(v.limite))}
        onCancel={() => setAlterandoLimite(false)}
        destroyOnHidden
      >
        <CampoMoeda control={limiteForm.control} name="limite" label="Novo limite de crédito" obrigatorio />
      </Modal>

      <ConfirmDialog
        aberto={bloqueando}
        titulo="Bloquear este cliente?"
        descricao="O cliente não poderá receber novos pedidos até ser desbloqueado."
        rotuloConfirmar="Bloquear"
        perigo
        exigirMotivo
        rotuloMotivo="Motivo do bloqueio"
        carregando={bloqueio.bloquear.isPending}
        aoConfirmar={(motivo) =>
          bloqueio.bloquear.mutate(motivo ?? '', { onSuccess: () => setBloqueando(false) })
        }
        aoCancelar={() => setBloqueando(false)}
      />

      <ConfirmDialog
        aberto={confirmarStatus}
        titulo={c.ativo ? 'Inativar este cliente?' : 'Reativar este cliente?'}
        descricao={
          c.ativo ? 'O cliente deixa de aparecer para novos pedidos.' : 'O cliente volta a ficar disponível.'
        }
        rotuloConfirmar={c.ativo ? 'Inativar' : 'Reativar'}
        perigo={c.ativo}
        carregando={status.isPending}
        aoConfirmar={() => status.mutate(!c.ativo, { onSuccess: () => setConfirmarStatus(false) })}
        aoCancelar={() => setConfirmarStatus(false)}
      />

      <Modal
        open={contatoAberto}
        title="Adicionar contato"
        okText="Adicionar"
        okButtonProps={{ loading: adicionarContato.isPending }}
        onOk={contatoForm.handleSubmit((v) =>
          adicionarContato.mutate({
            nome: v.nome,
            cargo: v.cargo || undefined,
            email: v.email || undefined,
            telefone: v.telefone || undefined,
          }),
        )}
        onCancel={() => setContatoAberto(false)}
        destroyOnHidden
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoTexto control={contatoForm.control} name="nome" label="Nome" obrigatorio />
          <CampoTexto control={contatoForm.control} name="cargo" label="Cargo" />
          <CampoTexto control={contatoForm.control} name="email" label="Email" tipo="email" />
          <CampoTexto control={contatoForm.control} name="telefone" label="Telefone" />
        </div>
      </Modal>

      {enderecoDrawer && (
        <AdicionarEnderecoDrawer
          clienteId={clienteId}
          tipo={enderecoDrawer}
          aberto
          aoFechar={() => setEnderecoDrawer(null)}
        />
      )}
    </>
  );
}
