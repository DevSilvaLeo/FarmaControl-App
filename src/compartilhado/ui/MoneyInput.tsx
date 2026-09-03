import { InputNumber } from 'antd';

/**
 * Entrada de valor monetário BRL (`.spec/03` §3.8). Aceita vírgula decimal,
 * formata em tempo real, emite `number`. Para cálculo de preview usar
 * `paraDecimal`/`decimal.js` (`.spec/12` D-09) — nunca aritmética `number` crua
 * para dinheiro.
 */
export function MoneyInput({
  value,
  onChange,
  onBlur,
  disabled,
  min = 0,
  max,
  status,
  placeholder = '0,00',
  id,
  'aria-label': ariaLabel,
}: {
  value?: number | null;
  onChange?: (valor: number | null) => void;
  onBlur?: () => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  status?: 'error' | 'warning';
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
}) {
  return (
    <InputNumber
      id={id}
      aria-label={ariaLabel}
      className="w-full"
      value={value ?? null}
      onChange={(v) => onChange?.(typeof v === 'number' ? v : v == null ? null : Number(v))}
      onBlur={onBlur}
      disabled={disabled}
      min={min}
      max={max}
      status={status}
      placeholder={placeholder}
      prefix="R$"
      decimalSeparator=","
      precision={2}
      step={0.01}
      style={{ textAlign: 'right' }}
      formatter={(v) => {
        if (v == null) return '';
        const n = Number(v);
        return Number.isFinite(n)
          ? new Intl.NumberFormat('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(n)
          : '';
      }}
      parser={(v) => (v ? Number(v.replace(/\./g, '').replace(',', '.')) : 0)}
    />
  );
}
