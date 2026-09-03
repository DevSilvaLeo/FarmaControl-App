import { ParceiroListaPage } from '../componentes/ParceiroListaPage';
import { useListarFornecedores } from '../hooks/useParceiros';

export function FornecedorListaPage() {
  return (
    <ParceiroListaPage
      titulo="Fornecedores"
      descricao="Fornecedores de mercadoria."
      rotaBase="/fornecedores"
      usarConsulta={useListarFornecedores}
    />
  );
}
