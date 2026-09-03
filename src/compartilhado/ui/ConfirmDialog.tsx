import { useEffect, useState, type ReactNode } from 'react';
import { Input, Modal } from 'antd';

/**
 * Modal de confirmação padronizado para ação destrutiva / irreversível-na-
 * prática (`.spec/05` §5.4): `bloquear`, `inativar`, ajuste de estoque, etc.
 *
 * `exigirMotivo` liga um campo de texto obrigatório — usar sempre que o
 * endpoint correspondente do backend também exige `Motivo`
 * (ex.: `BloquearClienteCommand`).
 */
export function ConfirmDialog({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar = 'Confirmar',
  rotuloCancelar = 'Cancelar',
  perigo = false,
  exigirMotivo = false,
  rotuloMotivo = 'Motivo',
  carregando = false,
  aoConfirmar,
  aoCancelar,
}: {
  aberto: boolean;
  titulo: ReactNode;
  descricao?: ReactNode;
  rotuloConfirmar?: string;
  rotuloCancelar?: string;
  perigo?: boolean;
  exigirMotivo?: boolean;
  rotuloMotivo?: string;
  carregando?: boolean;
  aoConfirmar: (motivo?: string) => void;
  aoCancelar: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [tocado, setTocado] = useState(false);

  useEffect(() => {
    if (aberto) {
      setMotivo('');
      setTocado(false);
    }
  }, [aberto]);

  const motivoInvalido = exigirMotivo && motivo.trim().length === 0;

  return (
    <Modal
      open={aberto}
      title={titulo}
      okText={rotuloConfirmar}
      cancelText={rotuloCancelar}
      okButtonProps={{ danger: perigo, loading: carregando, disabled: motivoInvalido }}
      cancelButtonProps={{ disabled: carregando }}
      onOk={() => {
        if (motivoInvalido) {
          setTocado(true);
          return;
        }
        aoConfirmar(exigirMotivo ? motivo.trim() : undefined);
      }}
      onCancel={() => {
        if (!carregando) aoCancelar();
      }}
      destroyOnHidden
    >
      {descricao != null && <div className="text-neutral-700">{descricao}</div>}
      {exigirMotivo && (
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium text-neutral-600">
            {rotuloMotivo} <span className="text-erro">*</span>
          </span>
          <Input.TextArea
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            onBlur={() => setTocado(true)}
            status={tocado && motivoInvalido ? 'error' : undefined}
            placeholder="Descreva o motivo desta ação"
          />
          {tocado && motivoInvalido && (
            <span className="mt-1 block text-xs text-erro">Informe o motivo.</span>
          )}
        </label>
      )}
    </Modal>
  );
}
