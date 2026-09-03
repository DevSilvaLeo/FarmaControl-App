import { type Key, type ReactNode } from 'react';
import { Button, Input, Pagination, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { UseQueryResult } from '@tanstack/react-query';
import { PlusOutlined } from '@ant-design/icons';
import { usePaginacao } from '@/compartilhado/hooks/usePaginacao';
import { useBreakpoint } from '@/compartilhado/hooks/useBreakpoint';
import { RequerPermissao } from '@/compartilhado/auth/RequerPermissao';
import { EmptyState } from './EmptyState';
import { FiltrosResponsivos } from './FiltrosResponsivos';
import type { PagedResult } from '@/compartilhado/api/tipos';

/** Coluna de tabela + marcação de tier responsivo (`agents.md` §4.2). */
export type ColunaResponsiva<T> = ColumnType<T> & {
  /** Só aparece a partir de `lg:` (na faixa tablet/`md` fica oculta). */
  apenasDesktop?: boolean;
};

export interface DataTableProps<T> {
  colunas: ColunaResponsiva<T>[];
  /** Hook de consulta do módulo — deve ler a paginação/filtros da URL. */
  usarConsulta: () => UseQueryResult<PagedResult<T>>;
  rowKey: keyof T | ((registro: T) => Key);
  /** Barra de filtros específica da tela (adaptada por `FiltrosResponsivos`). */
  filtros?: ReactNode;
  qtdFiltrosAtivos?: number;
  /** Busca textual sempre visível (`.spec/03` §3.9). */
  buscaTextual?: { valor: string; aoMudar: (v: string) => void; placeholder?: string };
  aoClicarLinha?: (registro: T) => void;
  acaoPrincipal?: { rotulo: string; permissao?: string; aoClicar: () => void };
  /** Render de card para o modo mobile (< md). Se ausente, usa as 3 primeiras colunas. */
  renderCardMobile?: (registro: T) => ReactNode;
  /** Estado do filtro para diferenciar "sem registro" de "sem resultado". */
  temFiltroAtivo?: boolean;
  aoLimparFiltros?: () => void;
  /** Listas não paginadas (`IReadOnlyList` do backend) — esconde a paginação. */
  semPaginacao?: boolean;
}

export function DataTable<T extends object>({
  colunas,
  usarConsulta,
  rowKey,
  filtros,
  qtdFiltrosAtivos = 0,
  buscaTextual,
  aoClicarLinha,
  acaoPrincipal,
  renderCardMobile,
  temFiltroAtivo = false,
  aoLimparFiltros,
  semPaginacao = false,
}: DataTableProps<T>) {
  const { ehMobile, ehTablet } = useBreakpoint();
  const { pagina, tamanhoPagina, irParaPagina, definirTamanhoPagina } = usePaginacao();
  const consulta = usarConsulta();

  const dados = consulta.data;
  const itens = dados?.itens ?? [];
  const chaveDe = (r: T): Key => (typeof rowKey === 'function' ? rowKey(r) : (r[rowKey] as Key));

  // Tier de colunas: na faixa tablet (md..lg) oculta as `apenasDesktop`.
  const colunasVisiveis = ehTablet ? colunas.filter((c) => !c.apenasDesktop) : colunas;

  const botaoNovo = acaoPrincipal ? (
    <RequerPermissao chave={acaoPrincipal.permissao}>
      <Button type="primary" icon={<PlusOutlined />} onClick={acaoPrincipal.aoClicar}>
        {acaoPrincipal.rotulo}
      </Button>
    </RequerPermissao>
  ) : null;

  const vazio =
    !consulta.isLoading && itens.length === 0 ? (
      temFiltroAtivo ? (
        <EmptyState
          variante="semResultado"
          titulo="Nenhum resultado para os filtros aplicados"
          descricao="Ajuste ou limpe os filtros para ver mais registros."
          aoLimparFiltros={aoLimparFiltros}
        />
      ) : (
        <EmptyState
          titulo="Nenhum registro cadastrado"
          descricao="Comece criando o primeiro registro."
          acao={botaoNovo}
        />
      )
    ) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {buscaTextual && (
            <Input.Search
              allowClear
              className="sm:max-w-xs"
              placeholder={buscaTextual.placeholder ?? 'Buscar…'}
              defaultValue={buscaTextual.valor}
              onChange={(e) => buscaTextual.aoMudar(e.target.value)}
            />
          )}
          {filtros && (
            <FiltrosResponsivos qtdAtivos={qtdFiltrosAtivos} aoLimpar={aoLimparFiltros}>
              {filtros}
            </FiltrosResponsivos>
          )}
        </div>
        {botaoNovo}
      </div>

      {vazio}

      {!vazio && ehMobile && (
        <div className="flex flex-col gap-2">
          {consulta.isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-neutral-100" />
              ))
            : itens.map((registro) => (
                <button
                  key={chaveDe(registro)}
                  type="button"
                  onClick={() => aoClicarLinha?.(registro)}
                  className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-sm active:bg-neutral-50"
                >
                  {renderCardMobile
                    ? renderCardMobile(registro)
                    : colunas.slice(0, 3).map((c, i) => (
                        <div
                          key={i}
                          className={
                            i === 0 ? 'font-medium text-neutral-800' : 'text-sm text-neutral-500'
                          }
                        >
                          {'dataIndex' in c && c.dataIndex != null
                            ? String(
                                (registro as Record<string, unknown>)[String(c.dataIndex)] ?? '',
                              )
                            : null}
                        </div>
                      ))}
                </button>
              ))}
        </div>
      )}

      {!vazio && !ehMobile && (
        <Table<T>
          columns={colunasVisiveis}
          dataSource={itens}
          rowKey={(r) => chaveDe(r)}
          loading={consulta.isLoading}
          pagination={false}
          size="middle"
          scroll={{ x: 'max-content' }}
          onRow={(registro) => ({
            onClick: () => aoClicarLinha?.(registro),
            style: aoClicarLinha ? { cursor: 'pointer' } : undefined,
          })}
        />
      )}

      {!semPaginacao && dados && dados.totalRegistros > 0 && (
        <div className="flex justify-end">
          <Pagination
            current={pagina}
            pageSize={tamanhoPagina}
            total={dados.totalRegistros}
            showSizeChanger
            size={ehMobile ? 'small' : undefined}
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={(p, ps) => {
              if (ps !== tamanhoPagina) definirTamanhoPagina(ps);
              else irParaPagina(p);
            }}
            showTotal={(total) => `${total} registro${total === 1 ? '' : 's'}`}
          />
        </div>
      )}
    </div>
  );
}
