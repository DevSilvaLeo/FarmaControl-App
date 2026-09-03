import { Alert } from 'antd';
import { PageHeader } from '@/compartilhado/ui/PageHeader';

/**
 * Placeholder do Painel (`.spec/04` §4.3 item 6). O painel real (KPIs por
 * permissão, widget "Lotes a Vencer") é a Etapa 7 (`.docs/09` §9.6).
 */
export function PainelPage() {
  return (
    <>
      <PageHeader titulo="Painel" descricao="Visão geral do sistema." />
      <Alert
        type="info"
        showIcon
        title="Painel em construção"
        description="Os indicadores por permissão e o widget de lotes a vencer entram na Etapa 7 do roadmap de UX."
      />
    </>
  );
}
