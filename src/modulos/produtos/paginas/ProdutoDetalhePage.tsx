import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Modal, Skeleton } from 'antd';
import { DetailPage } from '@/compartilhado/ui/DetailPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { GridEmbutido, type ColunaGrid } from '@/compartilhado/ui/GridEmbutido';
import { CampoMoeda, CampoNumero } from '@/compartilhado/ui/campos';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { formatarMoeda } from '@/compartilhado/utils/formatarMoeda';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { precosSchema, type PrecosForm } from '../validacao';
import {
  useAlterarStatusProduto,
  useDefinirPrecos,
  useDefinirUnidades,
  useProduto,
  useUnidades,
} from '../hooks/useProdutos';
import type { ProdutoUnidadeDto } from '../tipos';

export function ProdutoDetalhePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const produtoId = Number(id);
  const valido = Number.isFinite(produtoId);
  const { data: produto, isLoading, isError } = useProduto(valido ? produtoId : undefined);
  const { data: unidades = [] } = useUnidades();

  const [editandoPrecos, setEditandoPrecos] = useState(false);
  const [confirmarStatus, setConfirmarStatus] = useState(false);
  const [unidadesAlt, setUnidadesAlt] = useState<ProdutoUnidadeDto[]>([]);

  useEffect(() => {
    if (produto) setUnidadesAlt(produto.unidadesAlternativas ?? []);
  }, [produto]);

  const precosForm = useForm<PrecosForm>({ resolver: zodResolver(precosSchema) });
  const definirPrecos = useDefinirPrecos(produtoId, { aoSalvar: () => setEditandoPrecos(false) });
  const definirUnidades = useDefinirUnidades(produtoId);
  const status = useAlterarStatusProduto(produtoId);

  useEffect(() => {
    if (produto && editandoPrecos) {
      precosForm.reset({
        precoCusto: produto.precoCusto,
        precoVenda: produto.precoVenda,
        margemPadrao: produto.margemPadrao ?? null,
        percentualComissao: produto.percentualComissao ?? null,
      });
    }
  }, [produto, editandoPrecos, precosForm]);

  if (isError) return <NaoEncontradoPage />;
  if (isLoading || !produto) return <Skeleton active paragraph={{ rows: 8 }} />;

  const colsUnidades: ColunaGrid<ProdutoUnidadeDto>[] = [
    {
      chave: 'unidadeId',
      titulo: 'Unidade',
      larguraLg: 200,
      render: (l, up) => (
        <select
          className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
          value={l.unidadeId || ''}
          onChange={(e) => up({ unidadeId: Number(e.target.value) })}
        >
          <option value="">—</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.sigla} — {u.descricao}
            </option>
          ))}
        </select>
      ),
    },
    {
      chave: 'fator',
      titulo: 'Fator de conversão',
      larguraLg: 160,
      render: (l, up) => (
        <input
          type="number"
          className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
          value={l.fator}
          onChange={(e) => up({ fator: Number(e.target.value) })}
        />
      ),
    },
    {
      chave: 'ehUnidadeCompra',
      titulo: 'É de compra',
      larguraLg: 110,
      render: (l, up) => (
        <input
          type="checkbox"
          checked={l.ehUnidadeCompra}
          onChange={(e) => up({ ehUnidadeCompra: e.target.checked })}
        />
      ),
    },
    {
      chave: 'ehUnidadeVenda',
      titulo: 'É de venda',
      larguraLg: 110,
      render: (l, up) => (
        <input
          type="checkbox"
          checked={l.ehUnidadeVenda}
          onChange={(e) => up({ ehUnidadeVenda: e.target.checked })}
        />
      ),
    },
  ];

  const unidadesMudaram =
    JSON.stringify(unidadesAlt) !== JSON.stringify(produto.unidadesAlternativas ?? []);

  return (
    <>
      <DetailPage
        titulo={produto.descricao}
        subtitulo={produto.codigoBarras ? `Cód. barras ${produto.codigoBarras}` : undefined}
        statusTag={<StatusTag variante={produto.ativo ? 'ativo' : 'inativo'} />}
        voltarPara="/produtos"
        acoes={[
          {
            chave: 'editar',
            rotulo: 'Editar',
            permissao: Permissoes.ProdutosGerenciar,
            aoClicar: () => navigate(`/produtos/${produtoId}/editar`),
          },
          {
            chave: 'precos',
            rotulo: 'Definir preços',
            permissao: Permissoes.ProdutosGerenciar,
            aoClicar: () => setEditandoPrecos(true),
          },
          {
            chave: 'status',
            rotulo: produto.ativo ? 'Inativar' : 'Reativar',
            perigo: produto.ativo,
            permissao: Permissoes.ProdutosGerenciar,
            aoClicar: () => setConfirmarStatus(true),
          },
        ]}
        secoes={[
          {
            chave: 'precos',
            titulo: 'Preços',
            conteudo: (
              <SectionCard titulo="Preços">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                  {[
                    ['Preço de custo', formatarMoeda(produto.precoCusto)],
                    ['Custo médio', formatarMoeda(produto.custoMedio)],
                    ['Preço de venda', formatarMoeda(produto.precoVenda)],
                    ['Margem padrão', produto.margemPadrao != null ? `${produto.margemPadrao}%` : '—'],
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
            chave: 'unidades',
            titulo: 'Unidades alternativas',
            conteudo: (
              <SectionCard
                titulo="Unidades alternativas"
                descricao="Substituição total ao salvar."
                acoes={
                  <Button
                    type="primary"
                    disabled={!unidadesMudaram}
                    loading={definirUnidades.isPending}
                    onClick={() => definirUnidades.mutate(unidadesAlt)}
                  >
                    Salvar unidades
                  </Button>
                }
              >
                <GridEmbutido<ProdutoUnidadeDto>
                  valor={unidadesAlt}
                  aoMudar={setUnidadesAlt}
                  colunas={colsUnidades}
                  novaLinha={() => ({ unidadeId: 0, fator: 1, ehUnidadeCompra: false, ehUnidadeVenda: false })}
                  rotuloAdicionar="Adicionar unidade"
                />
              </SectionCard>
            ),
          },
        ]}
      />

      <Modal
        open={editandoPrecos}
        title="Definir preços"
        okText="Salvar"
        okButtonProps={{ loading: definirPrecos.isPending }}
        onOk={precosForm.handleSubmit((v) =>
          definirPrecos.mutate({
            precoCusto: v.precoCusto,
            precoVenda: v.precoVenda,
            margemPadrao: v.margemPadrao ?? null,
            percentualComissao: v.percentualComissao ?? null,
          }),
        )}
        onCancel={() => setEditandoPrecos(false)}
        destroyOnHidden
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoMoeda control={precosForm.control} name="precoCusto" label="Preço de custo" obrigatorio />
          <CampoMoeda control={precosForm.control} name="precoVenda" label="Preço de venda" obrigatorio />
          <CampoNumero control={precosForm.control} name="margemPadrao" label="Margem padrão (%)" min={0} sufixo="%" />
          <CampoNumero control={precosForm.control} name="percentualComissao" label="Comissão (%)" min={0} sufixo="%" />
        </div>
      </Modal>

      <ConfirmDialog
        aberto={confirmarStatus}
        titulo={produto.ativo ? 'Inativar este produto?' : 'Reativar este produto?'}
        descricao={
          produto.ativo
            ? 'O produto deixa de aparecer para novas vendas e movimentações.'
            : 'O produto volta a ficar disponível.'
        }
        rotuloConfirmar={produto.ativo ? 'Inativar' : 'Reativar'}
        perigo={produto.ativo}
        carregando={status.isPending}
        aoConfirmar={() =>
          status.mutate(!produto.ativo, { onSuccess: () => setConfirmarStatus(false) })
        }
        aoCancelar={() => setConfirmarStatus(false)}
      />
    </>
  );
}
