import { DatePicker } from 'antd';
import { FORMATO_DATA, FORMATO_DATA_HORA, dayjs, localParaUtcIso, utcParaLocal } from '@/compartilhado/utils/datas';

/**
 * `<DatePicker>` do Ant Design com conversão UTC↔local encapsulada
 * (`.spec/03` §3.7, `.spec/12` D-08). `value`/`onChange` trabalham com
 * **ISO/UTC string** — a tela nunca lida com fuso na mão.
 */
export function DatePickerBr({
  value,
  onChange,
  onBlur,
  comHora = false,
  disabled,
  status,
  placeholder,
  id,
  'aria-label': ariaLabel,
}: {
  value?: string | null;
  onChange?: (isoUtc: string | null) => void;
  onBlur?: () => void;
  comHora?: boolean;
  disabled?: boolean;
  status?: 'error' | 'warning';
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
}) {
  return (
    <DatePicker
      id={id}
      aria-label={ariaLabel}
      className="w-full"
      value={utcParaLocal(value ?? undefined) ?? undefined}
      onChange={(d) => onChange?.(localParaUtcIso(d))}
      onBlur={onBlur}
      disabled={disabled}
      status={status}
      showTime={comHora ? { format: 'HH:mm' } : false}
      format={comHora ? FORMATO_DATA_HORA : FORMATO_DATA}
      placeholder={placeholder ?? (comHora ? 'dd/mm/aaaa hh:mm' : 'dd/mm/aaaa')}
      // impede escolher hora "quebrada" quando não é campo com hora
      defaultPickerValue={dayjs()}
    />
  );
}

/**
 * Range de datas (De/Até) — Kardex, relatórios. Emite `[isoUtc, isoUtc]`.
 */
export function RangePickerBr({
  value,
  onChange,
  disabled,
  status,
}: {
  value?: [string | null, string | null] | null;
  onChange?: (intervalo: [string | null, string | null] | null) => void;
  disabled?: boolean;
  status?: 'error' | 'warning';
}) {
  const inicio = utcParaLocal(value?.[0] ?? undefined) ?? null;
  const fim = utcParaLocal(value?.[1] ?? undefined) ?? null;

  return (
    <DatePicker.RangePicker
      className="w-full"
      value={inicio && fim ? [inicio, fim] : null}
      onChange={(intervalo) =>
        onChange?.(
          intervalo ? [localParaUtcIso(intervalo[0]), localParaUtcIso(intervalo[1])] : null,
        )
      }
      disabled={disabled}
      status={status}
      format={FORMATO_DATA}
      placeholder={['Data inicial', 'Data final']}
    />
  );
}
