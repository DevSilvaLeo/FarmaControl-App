import { useEffect } from 'react';
import { Select } from 'antd';
import { useDepositos } from '../hooks/useEstoque';

/**
 * Select de depósito. Pré-seleciona o depósito padrão quando `autoPadrao` e
 * nada foi escolhido ainda (`.spec/09` §9.3.1).
 */
export function SelectDeposito({
  value,
  onChange,
  autoPadrao = false,
  permitirVazio = false,
}: {
  value?: number | null;
  onChange: (id: number | null) => void;
  autoPadrao?: boolean;
  permitirVazio?: boolean;
}) {
  const { data: depositos = [] } = useDepositos();

  useEffect(() => {
    if (autoPadrao && value == null) {
      const padrao = depositos.find((d) => d.padrao && d.ativo);
      if (padrao) onChange(padrao.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositos, autoPadrao]);

  return (
    <Select
      className="w-full"
      allowClear={permitirVazio}
      showSearch
      optionFilterProp="label"
      placeholder={permitirVazio ? 'Todos os depósitos' : 'Selecione o depósito'}
      value={value ?? undefined}
      onChange={(v) => onChange((v as number) ?? null)}
      options={depositos
        .filter((d) => d.ativo)
        .map((d) => ({ value: d.id, label: `${d.nome} (${d.codigo})` }))}
    />
  );
}
