import { Tag } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LockFilled,
  StarFilled,
  ToolFilled,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

/**
 * `<Tag>` de estado padronizada pelos tokens semânticos (`.docs/01` §1.4,
 * `.docs/04` §4.2). Sempre com texto — nunca só cor.
 */
export type VarianteStatus = 'ativo' | 'inativo' | 'bloqueado' | 'padrao' | 'sistema';

const config: Record<VarianteStatus, { cor: string; icone: ReactNode; rotulo: string }> = {
  ativo: { cor: 'success', icone: <CheckCircleFilled />, rotulo: 'Ativo' },
  inativo: { cor: 'default', icone: <CloseCircleFilled />, rotulo: 'Inativo' },
  bloqueado: { cor: 'error', icone: <LockFilled />, rotulo: 'Bloqueado' },
  padrao: { cor: 'processing', icone: <StarFilled />, rotulo: 'Padrão' },
  sistema: { cor: 'cyan', icone: <ToolFilled />, rotulo: 'Sistema' },
};

export function StatusTag({
  variante,
  rotulo,
  semIcone = false,
}: {
  variante: VarianteStatus;
  rotulo?: string;
  semIcone?: boolean;
}) {
  const c = config[variante];
  return (
    <Tag color={c.cor} icon={semIcone ? undefined : c.icone} style={{ marginInlineEnd: 0 }}>
      {rotulo ?? c.rotulo}
    </Tag>
  );
}

/** Atalho: recebe o booleano `ativo` e devolve a tag Ativo/Inativo. */
export function TagAtivo({ ativo }: { ativo: boolean }) {
  return <StatusTag variante={ativo ? 'ativo' : 'inativo'} />;
}
