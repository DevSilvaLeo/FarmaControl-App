import { useEffect, useState } from 'react';
import { Button, InputNumber, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { EmptyState } from '@/compartilhado/ui/EmptyState';
import { usePermissao } from '@/compartilhado/auth/usePermissao';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { useParametrosEstoque, useSalvarParametroEstoque } from '../hooks/useEstoque';
import { SelectProduto } from '../componentes/SelectProduto';
import type { ParametroEstoqueDepositoDto } from '../tipos';

interface LinhaEditavel extends ParametroEstoqueDepositoDto {
  minEdit: number;
  maxEdit: number;
}

export function ParametrosEstoquePage() {
  const { tem } = usePermissao();
  const podeGerenciar = tem(Permissoes.EstoqueGerenciarParametros);
  const [produtoId, setProdutoId] = useState<number>();
  const [produtoNome, setProdutoNome] = useState('');
  const { data, isLoading } = useParametrosEstoque(produtoId);
  const salvar = useSalvarParametroEstoque(produtoId);

  const [linhas, setLinhas] = useState<LinhaEditavel[]>([]);
  useEffect(() => {
    setLinhas((data ?? []).map((p) => ({ ...p, minEdit: p.estoqueMinimo, maxEdit: p.estoqueMaximo })));
  }, [data]);

  const alterar = (depositoId: number, campo: 'minEdit' | 'maxEdit', valor: number | null) =>
    setLinhas((atual) =>
      atual.map((l) => (l.depositoId === depositoId ? { ...l, [campo]: valor ?? 0 } : l)),
    );

  const colunas: ColumnsType<LinhaEditavel> = [
    {
      title: 'Depósito',
      dataIndex: 'depositoNome',
      render: (v: string, l) => (
        <span>
          {v} {l.personalizado ? <Tag color="blue">Personalizado</Tag> : <Tag>Padrão do produto</Tag>}
        </span>
      ),
    },
    {
      title: 'Estoque mínimo',
      dataIndex: 'minEdit',
      align: 'right',
      render: (v: number, l) => (
        <InputNumber
          min={0}
          value={v}
          disabled={!podeGerenciar}
          onChange={(n) => alterar(l.depositoId, 'minEdit', n)}
        />
      ),
    },
    {
      title: 'Estoque máximo',
      dataIndex: 'maxEdit',
      align: 'right',
      render: (v: number, l) => (
        <InputNumber
          min={0}
          value={v}
          disabled={!podeGerenciar}
          onChange={(n) => alterar(l.depositoId, 'maxEdit', n)}
        />
      ),
    },
    {
      title: '',
      key: 'acoes',
      render: (_: unknown, l) =>
        podeGerenciar ? (
          <div className="flex gap-2">
            <Button
              size="small"
              type="primary"
              loading={salvar.definir.isPending}
              disabled={l.minEdit === l.estoqueMinimo && l.maxEdit === l.estoqueMaximo}
              onClick={() =>
                salvar.definir.mutate({
                  produtoId: produtoId!,
                  depositoId: l.depositoId,
                  estoqueMinimo: l.minEdit,
                  estoqueMaximo: l.maxEdit,
                })
              }
            >
              Salvar
            </Button>
            {l.personalizado && (
              <Button
                size="small"
                loading={salvar.remover.isPending}
                onClick={() => salvar.remover.mutate(l.depositoId)}
              >
                Usar padrão do produto
              </Button>
            )}
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        titulo="Estoque mínimo/máximo por depósito"
        descricao="Cada depósito pode ter seus próprios limites; sem personalização, valem os do cadastro do produto."
      />

      <SectionCard titulo="Produto" className="mb-4">
        <div className="max-w-md">
          <SelectProduto
            value={produtoId ?? null}
            onChange={(id, p) => {
              setProdutoId(id ?? undefined);
              setProdutoNome(p?.descricao ?? '');
            }}
          />
        </div>
      </SectionCard>

      {produtoId == null ? (
        <EmptyState variante="semResultado" titulo="Selecione um produto" />
      ) : (
        <>
          {!podeGerenciar && (
            <p className="mb-2 text-sm text-neutral-500">
              Você tem acesso apenas de leitura a estes parâmetros.
            </p>
          )}
          <div className="mb-2 text-sm text-neutral-500">{produtoNome}</div>
          <Table<LinhaEditavel>
            rowKey="depositoId"
            columns={colunas}
            dataSource={linhas}
            loading={isLoading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </>
      )}
    </>
  );
}
