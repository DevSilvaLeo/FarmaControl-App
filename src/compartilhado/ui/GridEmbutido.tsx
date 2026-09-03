import { useState, type Key, type ReactNode } from 'react';
import { Alert, Button } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useBreakpoint } from '@/compartilhado/hooks/useBreakpoint';
import { ConfirmDialog } from './ConfirmDialog';

export interface ColunaGrid<T> {
  chave: string;
  titulo: string;
  larguraLg?: number | string;
  /** Renderiza a célula editável. `atualizar` faz merge parcial na linha. */
  render: (linha: T, atualizar: (parcial: Partial<T>) => void, indice: number) => ReactNode;
}

/**
 * Grid embutido editável (`agents.md` §4.2, `.docs/03` §3.5):
 *  - `< lg` : lista vertical de **cards editáveis** (um card = uma linha).
 *  - `lg:`  : tabela editável.
 *
 * Usado por Produto (unidades alternativas), Vendedor (metas de comissão),
 * Cliente (contatos) — o salvamento (ex.: `PUT .../unidades` substituindo a
 * lista inteira) é responsabilidade da tela hospedeira.
 */
export function GridEmbutido<T>({
  valor,
  aoMudar,
  colunas,
  novaLinha,
  rotuloAdicionar = 'Adicionar linha',
  chaveDe = (_l, i) => i,
  avisos,
  confirmarAoRemover = false,
  disabled = false,
  vazioTexto = 'Nenhum item adicionado.',
}: {
  valor: T[];
  aoMudar: (linhas: T[]) => void;
  colunas: ColunaGrid<T>[];
  novaLinha: () => T;
  rotuloAdicionar?: string;
  chaveDe?: (linha: T, indice: number) => Key;
  avisos?: ReactNode;
  confirmarAoRemover?: boolean;
  disabled?: boolean;
  vazioTexto?: string;
}) {
  const { ehDesktop } = useBreakpoint();
  const [removendo, setRemovendo] = useState<number | null>(null);

  const atualizarLinha = (indice: number, parcial: Partial<T>) => {
    aoMudar(valor.map((l, i) => (i === indice ? { ...l, ...parcial } : l)));
  };
  const adicionar = () => aoMudar([...valor, novaLinha()]);
  const remover = (indice: number) => aoMudar(valor.filter((_, i) => i !== indice));

  const pedirRemocao = (indice: number) => {
    if (confirmarAoRemover) setRemovendo(indice);
    else remover(indice);
  };

  const botaoRemover = (indice: number) => (
    <Button
      type="text"
      size="small"
      danger
      aria-label="Remover linha"
      icon={<DeleteOutlined />}
      disabled={disabled}
      onClick={() => pedirRemocao(indice)}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      {avisos != null && <Alert type="warning" showIcon title={avisos} />}

      {valor.length === 0 && <p className="m-0 text-sm text-neutral-500">{vazioTexto}</p>}

      {valor.length > 0 && ehDesktop && (
        <div className="overflow-x-auto rounded-md border border-neutral-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-neutral-600">
                {colunas.map((c) => (
                  <th key={c.chave} className="px-3 py-2 font-medium" style={{ width: c.larguraLg }}>
                    {c.titulo}
                  </th>
                ))}
                <th className="w-10 px-3 py-2" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {valor.map((linha, i) => (
                <tr key={chaveDe(linha, i)} className="border-t border-neutral-100">
                  {colunas.map((c) => (
                    <td key={c.chave} className="px-3 py-2 align-top">
                      {c.render(linha, (p) => atualizarLinha(i, p), i)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right align-top">{botaoRemover(i)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {valor.length > 0 && !ehDesktop && (
        <div className="flex flex-col gap-2">
          {valor.map((linha, i) => (
            <div
              key={chaveDe(linha, i)}
              className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Item {i + 1}</span>
                {botaoRemover(i)}
              </div>
              <div className="flex flex-col gap-3">
                {colunas.map((c) => (
                  <label key={c.chave} className="block">
                    <span className="mb-1 block text-xs font-medium text-neutral-600">{c.titulo}</span>
                    {c.render(linha, (p) => atualizarLinha(i, p), i)}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <Button icon={<PlusOutlined />} onClick={adicionar} disabled={disabled} block={!ehDesktop}>
          {rotuloAdicionar}
        </Button>
      </div>

      <ConfirmDialog
        aberto={removendo != null}
        titulo="Remover este item?"
        descricao="Esta linha será removida da lista ao salvar."
        rotuloConfirmar="Remover"
        perigo
        aoConfirmar={() => {
          if (removendo != null) remover(removendo);
          setRemovendo(null);
        }}
        aoCancelar={() => setRemovendo(null)}
      />
    </div>
  );
}
