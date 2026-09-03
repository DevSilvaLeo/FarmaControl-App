import { SelectAutocomplete } from '@/compartilhado/ui/SelectAutocomplete';
import { produtosApi } from '@/modulos/produtos/api';

export interface ProdutoSelecionado {
  id: number;
  descricao: string;
  controlaLote: boolean;
}

/** Autocomplete de Produto (`GET /produtos?termoBusca=`). Devolve também `controlaLote`. */
export function SelectProduto({
  value,
  onChange,
  status,
}: {
  value?: number | null;
  onChange: (id: number | null, produto?: ProdutoSelecionado) => void;
  status?: 'error';
}) {
  return (
    <SelectAutocomplete
      value={value ?? null}
      status={status}
      placeholder="Digite a descrição ou o código de barras"
      buscar={async (termo) => {
        const r = await produtosApi.listar({ pagina: 1, tamanhoPagina: 20, termoBusca: termo });
        return r.itens.map((p) => ({ value: p.id, label: p.descricao }));
      }}
      onChange={async (v) => {
        const id = (v as number) ?? null;
        if (id == null) {
          onChange(null);
          return;
        }
        try {
          const p = await produtosApi.obterPorId(id);
          onChange(id, { id, descricao: p.descricao, controlaLote: p.controlaLote });
        } catch {
          onChange(id);
        }
      }}
    />
  );
}
