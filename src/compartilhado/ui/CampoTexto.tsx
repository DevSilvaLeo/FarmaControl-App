import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input } from 'antd';

type TipoCampo = 'text' | 'email' | 'password' | 'textarea';

/**
 * Campo de texto controlado ligado ao React Hook Form via `Controller`
 * (`.spec/03` §3.4). Usar `Controller` — e não `register` cru — em componentes
 * do Ant Design, cujo `ref`/`onChange` não são de um `<input>` nativo.
 */
export function CampoTexto<T extends FieldValues>({
  control,
  name,
  label,
  obrigatorio = false,
  tipo = 'text',
  placeholder,
  autoComplete,
  autoFocus,
  disabled,
  mono = false,
  rows = 3,
  maxLength,
  className,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  obrigatorio?: boolean;
  tipo?: TipoCampo;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  mono?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const comum = {
          ...field,
          value: field.value ?? '',
          disabled,
          placeholder,
          maxLength,
          status: fieldState.error ? ('error' as const) : undefined,
          className: mono ? 'mono' : undefined,
        };
        return (
          <label className={`block ${className ?? ''}`}>
            <span className="mb-1 block text-sm font-medium text-neutral-600">
              {label}
              {obrigatorio && <span className="text-erro"> *</span>}
            </span>
            {tipo === 'textarea' ? (
              <Input.TextArea {...comum} rows={rows} />
            ) : tipo === 'password' ? (
              <Input.Password {...comum} autoComplete={autoComplete} />
            ) : (
              <Input
                {...comum}
                type={tipo === 'email' ? 'email' : undefined}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
              />
            )}
            {fieldState.error && (
              <span className="mt-1 block text-xs text-erro">{fieldState.error.message}</span>
            )}
          </label>
        );
      }}
    />
  );
}
