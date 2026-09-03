import { Input } from 'antd';

/**
 * Código TOTP de 6 dígitos (`.spec/06` §6.3). Input segmentado (`Input.OTP` do
 * antd v6): teclado numérico no mobile, colar distribui os 6 dígitos,
 * `onCompleto` dispara auto-submit ao completar — mesmo padrão de apps
 * bancários.
 */
export function CampoCodigoTotp({
  value,
  onChange,
  onCompleto,
  disabled,
  status,
}: {
  value?: string;
  onChange?: (codigo: string) => void;
  onCompleto?: (codigo: string) => void;
  disabled?: boolean;
  status?: 'error';
}) {
  return (
    <Input.OTP
      length={6}
      value={value}
      disabled={disabled}
      status={status}
      formatter={(str) => str.replace(/\D/g, '')}
      onChange={(v) => {
        onChange?.(v);
        if (/^\d{6}$/.test(v)) onCompleto?.(v);
      }}
    />
  );
}
