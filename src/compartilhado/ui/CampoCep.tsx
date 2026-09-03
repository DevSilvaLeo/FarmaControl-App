import { useState } from 'react';
import { Input, Spin } from 'antd';

export interface EnderecoPorCep {
  cep: string;
  logradouro?: string;
  bairro?: string;
  cidadeId?: number;
  cidadeNome?: string;
  uf?: string;
}

type Estado = 'ocioso' | 'consultando' | 'preenchido' | 'nao-encontrado';

/**
 * Campo de CEP com autopreenchimento de endereço (`.spec/07` §7.2). Ao perder
 * o foco com 8 dígitos, consulta `consultarCep` e chama `aoResolverEndereco`
 * — a tela hospedeira preenche logradouro/bairro/cidade/UF e deixa o usuário
 * confirmar número e complemento.
 *
 * `consultarCep` é injetado pelo módulo (implementação real na Etapa 4).
 */
export function CampoCep({
  value = '',
  onChange,
  consultarCep,
  aoResolverEndereco,
  disabled,
  status,
  id,
}: {
  value?: string;
  onChange?: (cep: string) => void;
  consultarCep: (cepDigitos: string) => Promise<EnderecoPorCep | null>;
  aoResolverEndereco?: (endereco: EnderecoPorCep) => void;
  disabled?: boolean;
  status?: 'error' | 'warning';
  id?: string;
}) {
  const [estado, setEstado] = useState<Estado>('ocioso');

  const formatar = (bruto: string) =>
    bruto
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/^(\d{5})(\d)/, '$1-$2');

  const consultar = async () => {
    const digitos = (value ?? '').replace(/\D/g, '');
    if (digitos.length !== 8) return;
    setEstado('consultando');
    try {
      const resultado = await consultarCep(digitos);
      if (resultado) {
        aoResolverEndereco?.(resultado);
        setEstado('preenchido');
      } else {
        setEstado('nao-encontrado');
      }
    } catch {
      setEstado('nao-encontrado');
    }
  };

  return (
    <div>
      <Input
        id={id}
        inputMode="numeric"
        placeholder="00000-000"
        maxLength={9}
        value={value}
        disabled={disabled}
        status={estado === 'nao-encontrado' ? 'warning' : status}
        onChange={(e) => {
          setEstado('ocioso');
          onChange?.(formatar(e.target.value));
        }}
        onBlur={consultar}
        suffix={estado === 'consultando' ? <Spin size="small" /> : null}
      />
      {estado === 'nao-encontrado' && (
        <span className="mt-1 block text-xs text-alerta-texto">
          CEP não encontrado. Preencha o endereço manualmente.
        </span>
      )}
    </div>
  );
}
