import type { ReactNode } from 'react';
import { App as AntApp, ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import 'dayjs/locale/pt-br';
import { temaAntd } from '@/compartilhado/tema/temaAntd';

/**
 * `ConfigProvider` do Ant Design v6 com o tema derivado da fonte única de
 * tokens (`.spec/04` §4.3 item 3, agents.md §5.1.3) e `locale={ptBR}` para os
 * textos internos dos componentes (paginação, date picker, etc.).
 *
 * `<AntApp>` habilita as APIs estáticas de `message`/`notification`/`modal`
 * com o tema aplicado (base para `compartilhado/ui/notificacoes.ts` na Etapa 1).
 */
export function TemaProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={temaAntd} locale={ptBR}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
