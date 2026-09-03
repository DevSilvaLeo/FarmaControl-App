import { useState } from 'react';
import { Button, Input, List, Modal } from 'antd';
import { CheckOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';

interface ItemBasico {
  id: number;
  nome: string;
}

/**
 * Modal genérico de cadastro de apoio (`.spec/07` §7.4): lista + criar +
 * renomear, sem sair do formulário de Produto.
 */
export function GerenciarApoioModal({
  aberto,
  titulo,
  itens,
  aoFechar,
  aoCriar,
  aoRenomear,
}: {
  aberto: boolean;
  titulo: string;
  itens: ItemBasico[];
  aoFechar: () => void;
  aoCriar: (nome: string) => Promise<unknown>;
  aoRenomear?: (id: number, nome: string) => Promise<unknown>;
}) {
  const [novo, setNovo] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState('');

  const criar = useMutacaoComErro((nome: string) => aoCriar(nome), {
    mensagemSucesso: 'Cadastrado.',
    onSuccess: () => setNovo(''),
  });
  const renomear = useMutacaoComErro(
    ({ id, nome }: { id: number; nome: string }) => aoRenomear!(id, nome),
    { mensagemSucesso: 'Renomeado.', onSuccess: () => setEditandoId(null) },
  );

  return (
    <Modal open={aberto} title={titulo} onCancel={aoFechar} footer={null} destroyOnHidden>
      <form
        className="mb-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (novo.trim()) criar.mutate(novo.trim());
        }}
      >
        <Input
          placeholder="Nome do novo item"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
        />
        <Button
          type="primary"
          htmlType="submit"
          icon={<PlusOutlined />}
          loading={criar.isPending}
          disabled={!novo.trim()}
        >
          Adicionar
        </Button>
      </form>

      <List
        size="small"
        bordered
        dataSource={itens}
        style={{ maxHeight: 320, overflowY: 'auto' }}
        renderItem={(item) =>
          editandoId === item.id ? (
            <List.Item
              actions={[
                <Button
                  key="ok"
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  loading={renomear.isPending}
                  onClick={() =>
                    editNome.trim() && renomear.mutate({ id: item.id, nome: editNome.trim() })
                  }
                />,
              ]}
            >
              <Input
                size="small"
                autoFocus
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
              />
            </List.Item>
          ) : (
            <List.Item
              actions={
                aoRenomear
                  ? [
                      <Button
                        key="edit"
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditandoId(item.id);
                          setEditNome(item.nome);
                        }}
                      />,
                    ]
                  : undefined
              }
            >
              {item.nome}
            </List.Item>
          )
        }
      />
    </Modal>
  );
}
