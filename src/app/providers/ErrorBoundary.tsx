import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  temErro: boolean;
}

/**
 * Rede de segurança de último nível (`.spec/04` §4.5): captura erro de
 * renderização não tratado e mostra fallback, nunca tela branca. O tratamento
 * fino de erro de API (toasts, erros de formulário) entra na Etapa 1.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { temErro: false };

  static getDerivedStateFromError(): State {
    return { temErro: true };
  }

  componentDidCatch(erro: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary capturou um erro de renderização', erro, info);
    }
  }

  private recarregar = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.temErro) {
      return (
        <div className="flex min-h-full items-center justify-center p-6">
          <Result
            status="error"
            title="Algo deu errado"
            subTitle="Ocorreu um erro inesperado ao exibir esta tela."
            extra={
              <Button type="primary" onClick={this.recarregar}>
                Recarregar página
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
