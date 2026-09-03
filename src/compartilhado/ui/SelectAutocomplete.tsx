import { useEffect, useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import { useDebounce } from '@/compartilhado/hooks/useDebounce';

export interface OpcaoAutocomplete {
  value: number | string;
  label: string;
}

/**
 * Select com busca assíncrona paginada (`.spec/05` §5.4). SEMPRE busca no
 * backend (nunca carrega a lista inteira — cidades são milhares). Debounce de
 * 400ms (`.spec/03` §3.9).
 *
 * `dependeDe`: quando muda (ex.: Grupo → Subgrupo), a seleção é limpa e a
 * busca é refeita (`.spec/07` §7.3.2).
 */
export function SelectAutocomplete({
  value,
  onChange,
  buscar,
  opcaoSelecionada,
  dependeDe,
  disabled,
  status,
  placeholder = 'Digite para buscar…',
  id,
  'aria-label': ariaLabel,
}: {
  value?: number | string | null;
  onChange?: (valor: number | string | null, opcao?: OpcaoAutocomplete) => void;
  /** Retorna as opções para um termo. Deve buscar no backend. */
  buscar: (termo: string) => Promise<OpcaoAutocomplete[]>;
  /** Opção já selecionada (para exibir o rótulo ao editar um registro). */
  opcaoSelecionada?: OpcaoAutocomplete | null;
  dependeDe?: unknown;
  disabled?: boolean;
  status?: 'error' | 'warning';
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
}) {
  const [termo, setTermo] = useState('');
  const termoDebounced = useDebounce(termo, 400);
  const [opcoes, setOpcoes] = useState<OpcaoAutocomplete[]>([]);
  const [carregando, setCarregando] = useState(false);

  const montado = useRef(false);
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    // dependência mudou depois do mount → limpa seleção e busca
    onChange?.(null);
    setOpcoes([]);
    setTermo('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependeDe]);

  useEffect(() => {
    let cancelado = false;
    if (termoDebounced.trim().length === 0) {
      setOpcoes([]);
      return;
    }
    setCarregando(true);
    buscar(termoDebounced)
      .then((r) => {
        if (!cancelado) setOpcoes(r);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termoDebounced]);

  const opcoesExibidas = useMemo(() => {
    if (opcaoSelecionada && !opcoes.some((o) => o.value === opcaoSelecionada.value)) {
      return [opcaoSelecionada, ...opcoes];
    }
    return opcoes;
  }, [opcoes, opcaoSelecionada]);

  return (
    <Select
      id={id}
      aria-label={ariaLabel}
      className="w-full"
      showSearch
      allowClear
      value={value ?? undefined}
      disabled={disabled}
      status={status}
      placeholder={placeholder}
      filterOption={false}
      onSearch={setTermo}
      onChange={(v) => onChange?.(v ?? null, opcoesExibidas.find((o) => o.value === v))}
      notFoundContent={carregando ? <Spin size="small" /> : termo ? 'Nenhum resultado' : null}
      options={opcoesExibidas}
    />
  );
}
