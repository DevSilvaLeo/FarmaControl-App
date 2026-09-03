import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Alert, Button, Steps, Typography } from 'antd';
import { CampoCodigoTotp } from './CampoCodigoTotp';
import { normalizarErro } from '@/compartilhado/api/normalizarErro';
import {
  useAtivarDoisFatores,
  useConfigurarDoisFatores,
} from '../hooks/useAutenticacao';

/**
 * Fluxo de configuração do 2FA (`.spec/06` §6.4). Passo 1: QR + segredo em
 * texto (fallback). Passo 2: confirmar com um código do app antes de ativar.
 * O segredo nunca é logado nem enviado a lugar nenhum além da própria API.
 */
export function ConfigurarDoisFatores({ aoConcluir }: { aoConcluir: () => void }) {
  const [passo, setPasso] = useState(0);
  const [codigo, setCodigo] = useState('');

  const configurar = useConfigurarDoisFatores();
  const ativar = useAtivarDoisFatores({ aoAtivar: aoConcluir });

  const iniciar = () =>
    configurar.mutate(undefined, { onSuccess: () => setPasso(1) });

  return (
    <div className="flex flex-col gap-4">
      <Steps
        size="small"
        current={passo}
        items={[{ title: 'Escanear' }, { title: 'Confirmar' }]}
      />

      {passo === 0 && (
        <div className="flex flex-col gap-3">
          <p className="m-0 text-sm text-neutral-600">
            Abra seu aplicativo autenticador (Google Authenticator, Authy, 1Password…) e escaneie o
            código, ou insira a chave manualmente.
          </p>
          <Button type="primary" onClick={iniciar} loading={configurar.isPending}>
            Gerar código
          </Button>
        </div>
      )}

      {passo === 1 && configurar.data && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-center rounded-lg border border-neutral-200 bg-white p-4">
            <QRCodeSVG value={configurar.data.uriOtpauth} size={192} />
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-neutral-500">Chave manual</span>
            <Typography.Text copyable className="mono break-all">
              {configurar.data.segredo}
            </Typography.Text>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-neutral-600">
              Digite o código gerado pelo app para confirmar
            </span>
            <CampoCodigoTotp
              value={codigo}
              onChange={setCodigo}
              onCompleto={(c) => ativar.mutate(c)}
              disabled={ativar.isPending}
              status={ativar.isError ? 'error' : undefined}
            />
            {ativar.isError && (
              <Alert
                className="mt-2"
                type="error"
                showIcon
                title={
                  normalizarErro(ativar.error).status === 422 ||
                  normalizarErro(ativar.error).status === 400
                    ? 'Código inválido. Verifique o app e tente novamente.'
                    : normalizarErro(ativar.error).mensagem
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
