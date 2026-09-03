import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Drawer } from 'antd';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoSwitch } from '@/compartilhado/ui/campos';
import { CampoEndereco } from '@/modulos/geografia/componentes/CampoEndereco';
import { enderecoSchema, type EnderecoForm } from '../validacao';
import { useAdicionarEndereco } from '../hooks/useClientes';

export function AdicionarEnderecoDrawer({
  clienteId,
  tipo,
  aberto,
  aoFechar,
}: {
  clienteId: number;
  tipo: 'entrega' | 'cobranca';
  aberto: boolean;
  aoFechar: () => void;
}) {
  const form = useForm<EnderecoForm>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: {
      destinatario: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidadeId: null,
      padrao: false,
    },
  });
  const adicionar = useAdicionarEndereco(clienteId, tipo, {
    aoAdicionar: () => {
      form.reset();
      aoFechar();
    },
  });

  return (
    <Drawer
      title={`Adicionar endereço de ${tipo}`}
      placement="right"
      size="large"
      open={aberto}
      onClose={aoFechar}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={aoFechar}>Cancelar</Button>
          <Button
            type="primary"
            loading={adicionar.isPending}
            onClick={form.handleSubmit((v) =>
              adicionar.mutate({
                destinatario: tipo === 'entrega' ? v.destinatario || undefined : undefined,
                cep: v.cep || undefined,
                logradouro: v.logradouro || undefined,
                numero: v.numero || undefined,
                complemento: v.complemento || undefined,
                bairro: v.bairro || undefined,
                cidadeId: v.cidadeId ?? null,
                padrao: !!v.padrao,
              }),
            )}
          >
            Adicionar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {tipo === 'entrega' && (
          <CampoTexto control={form.control} name="destinatario" label="Destinatário" />
        )}
        <CampoEndereco
          control={form.control}
          nomes={{
            cep: 'cep',
            logradouro: 'logradouro',
            numero: 'numero',
            complemento: 'complemento',
            bairro: 'bairro',
            cidadeId: 'cidadeId',
          }}
        />
        <CampoSwitch control={form.control} name="padrao" label="Definir como padrão" />
      </div>
    </Drawer>
  );
}
