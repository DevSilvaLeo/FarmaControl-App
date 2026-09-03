import type { ReactNode } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { InputNumber, Select, Switch } from 'antd';
import { MoneyInput } from './MoneyInput';
import { DatePickerBr } from './DatePickerBr';

/**
 * Campos controlados ligados ao React Hook Form via `Controller` (`.spec/03`
 * §3.4). Complementam `CampoTexto` para os formulários densos das Etapas 4+.
 */

interface Base<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  obrigatorio?: boolean;
  disabled?: boolean;
  ajuda?: ReactNode;
  className?: string;
}

function Rotulo({
  label,
  obrigatorio,
  aoLado,
}: {
  label: string;
  obrigatorio?: boolean;
  aoLado?: ReactNode;
}) {
  return (
    <span className="mb-1 flex items-center justify-between gap-2">
      <span className="text-sm font-medium text-neutral-600">
        {label}
        {obrigatorio && <span className="text-erro"> *</span>}
      </span>
      {aoLado}
    </span>
  );
}

function Erro({ msg, ajuda }: { msg?: string; ajuda?: ReactNode }) {
  if (msg) return <span className="mt-1 block text-xs text-erro">{msg}</span>;
  if (ajuda) return <span className="mt-1 block text-xs text-neutral-500">{ajuda}</span>;
  return null;
}

export function CampoSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  obrigatorio,
  disabled,
  placeholder = 'Selecione',
  ajuda,
  aoLado,
  className,
}: Base<T> & {
  options: { value: string | number; label: string }[];
  placeholder?: string;
  aoLado?: ReactNode;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <label className={`block ${className ?? ''}`}>
          <Rotulo label={label} obrigatorio={obrigatorio} aoLado={aoLado} />
          <Select
            className="w-full"
            showSearch
            allowClear={!obrigatorio}
            disabled={disabled}
            placeholder={placeholder}
            optionFilterProp="label"
            status={fieldState.error ? 'error' : undefined}
            value={field.value ?? undefined}
            onChange={(v) => field.onChange(v ?? null)}
            onBlur={field.onBlur}
            options={options}
          />
          <Erro msg={fieldState.error?.message} ajuda={ajuda} />
        </label>
      )}
    />
  );
}

export function CampoSwitch<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
  ajuda,
  className,
}: Base<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={`flex items-start justify-between gap-3 py-1 ${className ?? ''}`}>
          <span className="text-sm text-neutral-700">
            {label}
            {ajuda && <span className="mt-0.5 block text-xs text-neutral-500">{ajuda}</span>}
          </span>
          <Switch checked={!!field.value} onChange={field.onChange} disabled={disabled} />
        </div>
      )}
    />
  );
}

export function CampoNumero<T extends FieldValues>({
  control,
  name,
  label,
  obrigatorio,
  disabled,
  ajuda,
  min,
  max,
  precisao,
  sufixo,
  className,
}: Base<T> & { min?: number; max?: number; precisao?: number; sufixo?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <label className={`block ${className ?? ''}`}>
          <Rotulo label={label} obrigatorio={obrigatorio} />
          <InputNumber
            className="w-full"
            disabled={disabled}
            min={min}
            max={max}
            precision={precisao}
            suffix={sufixo}
            decimalSeparator=","
            status={fieldState.error ? 'error' : undefined}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v == null ? null : Number(v))}
            onBlur={field.onBlur}
          />
          <Erro msg={fieldState.error?.message} ajuda={ajuda} />
        </label>
      )}
    />
  );
}

export function CampoMoeda<T extends FieldValues>({
  control,
  name,
  label,
  obrigatorio,
  disabled,
  ajuda,
  className,
}: Base<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <label className={`block ${className ?? ''}`}>
          <Rotulo label={label} obrigatorio={obrigatorio} />
          <MoneyInput
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
            onBlur={field.onBlur}
            disabled={disabled}
            aria-label={label}
            status={fieldState.error ? 'error' : undefined}
          />
          <Erro msg={fieldState.error?.message} ajuda={ajuda} />
        </label>
      )}
    />
  );
}

export function CampoData<T extends FieldValues>({
  control,
  name,
  label,
  obrigatorio,
  disabled,
  ajuda,
  className,
}: Base<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <label className={`block ${className ?? ''}`}>
          <Rotulo label={label} obrigatorio={obrigatorio} />
          <DatePickerBr
            value={field.value ?? null}
            onChange={(iso) => field.onChange(iso)}
            onBlur={field.onBlur}
            disabled={disabled}
            status={fieldState.error ? 'error' : undefined}
            aria-label={label}
          />
          <Erro msg={fieldState.error?.message} ajuda={ajuda} />
        </label>
      )}
    />
  );
}
