import { useState } from 'react';
import { Button, Input, List, Modal, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSegmentos, useSalvarSegmento } from '../hooks/useClientes';

/** Cadastro rápido de Segmentos (`.spec/07` §7.6), a partir do formulário de Cliente. */
export function GerenciarSegmentosModal({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
}) {
  const { data: segmentos = [] } = useSegmentos();
  const [nome, setNome] = useState('');
  const [orgaoPublico, setOrgaoPublico] = useState(false);
  const salvar = useSalvarSegmento({
    aoSalvar: () => {
      setNome('');
      setOrgaoPublico(false);
    },
  });

  return (
    <Modal open={aberto} title="Segmentos" onCancel={aoFechar} footer={null} destroyOnHidden>
      <form
        className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (nome.trim()) salvar.mutate({ nome: nome.trim(), orgaoPublico });
        }}
      >
        <Input placeholder="Nome do segmento" value={nome} onChange={(e) => setNome(e.target.value)} />
        <label className="flex shrink-0 items-center gap-2 text-sm text-neutral-600">
          <Switch size="small" checked={orgaoPublico} onChange={setOrgaoPublico} />
          Órgão público
        </label>
        <Button
          type="primary"
          htmlType="submit"
          icon={<PlusOutlined />}
          loading={salvar.isPending}
          disabled={!nome.trim()}
        >
          Adicionar
        </Button>
      </form>

      <List
        size="small"
        bordered
        dataSource={segmentos}
        style={{ maxHeight: 320, overflowY: 'auto' }}
        renderItem={(s) => (
          <List.Item>
            {s.nome}
            {s.orgaoPublico && <span className="ml-2 text-xs text-neutral-500">(órgão público)</span>}
          </List.Item>
        )}
      />
    </Modal>
  );
}
