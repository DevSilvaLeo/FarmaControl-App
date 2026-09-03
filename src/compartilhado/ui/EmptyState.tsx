import type { ReactNode } from 'react';
import { Button } from 'antd';
import { InboxOutlined, SearchOutlined } from '@ant-design/icons';

/**
 * Estado vazio diferenciado (`.spec/03` §3.9, `.docs/03` §3.8):
 *  - `semRegistros`  → "nenhum registro cadastrado" + ação de criar.
 *  - `semResultado`  → "nenhum resultado para o filtro" + "Limpar filtros".
 */
export function EmptyState({
  variante = 'semRegistros',
  titulo,
  descricao,
  acao,
  aoLimparFiltros,
}: {
  variante?: 'semRegistros' | 'semResultado';
  titulo: string;
  descricao?: ReactNode;
  acao?: ReactNode;
  aoLimparFiltros?: () => void;
}) {
  const Icone = variante === 'semResultado' ? SearchOutlined : InboxOutlined;
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-200 bg-white px-6 py-12 text-center">
      <Icone className="text-4xl text-neutral-300" aria-hidden />
      <p className="m-0 text-base font-medium text-neutral-700">{titulo}</p>
      {descricao != null && (
        <p className="m-0 max-w-md text-sm text-neutral-500">{descricao}</p>
      )}
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        {variante === 'semResultado' && aoLimparFiltros != null && (
          <Button onClick={aoLimparFiltros}>Limpar filtros</Button>
        )}
        {acao}
      </div>
    </div>
  );
}
