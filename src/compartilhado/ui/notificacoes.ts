import { App } from 'antd';

/**
 * Sistema de notificação padronizado (`.spec/05` §5.5) — definido UMA vez,
 * com duração e posição consistentes em toda a aplicação.
 *
 * Usa `App.useApp()` do Ant Design v6 (o `<AntApp>` está no `TemaProvider`),
 * garantindo que os toasts herdam o tema do `ConfigProvider`.
 */
export function useNotificacoes() {
  const { message, notification } = App.useApp();

  return {
    /** Sucesso de mutação — curto, topo-direito, 3s. */
    sucesso: (texto: string) => {
      void message.success(texto, 3);
    },
    /** Erro de negócio (409/422) — mensagem do backend verbatim, 6s. */
    erro: (texto: string) => {
      notification.error({
        message: 'Não foi possível concluir',
        description: texto,
        placement: 'topRight',
        duration: 6,
      });
    },
    /** Aviso não bloqueante. */
    avisar: (texto: string) => {
      void message.warning(texto, 4);
    },
    /** Informação. */
    informar: (texto: string) => {
      void message.info(texto, 4);
    },
  };
}

export type Notificacoes = ReturnType<typeof useNotificacoes>;
