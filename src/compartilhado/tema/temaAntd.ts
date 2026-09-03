import type { ThemeConfig } from 'antd';
import { primary, neutral, semantic, fontFamily, radius, papeis } from './tokens';

/**
 * Tema do Ant Design v6 derivado da FONTE ÚNICA de tokens (`tokens.ts`).
 * Nenhum valor de cor/raio é digitado aqui — tudo vem de `tokens.ts`
 * (agents.md §5.1.3, `.docs/02` §2.1).
 */
export const temaAntd: ThemeConfig = {
  token: {
    colorPrimary: papeis.corPrimaria,
    colorInfo: semantic.info,
    colorSuccess: semantic.sucesso,
    colorWarning: semantic.alerta,
    colorError: semantic.erro,

    colorTextBase: papeis.corTextoForte,
    colorBgBase: papeis.corSuperficie,
    colorBgLayout: papeis.corFundoApp,
    colorBorder: papeis.corBorda,

    borderRadius: Number.parseInt(radius.md, 10),
    fontFamily: fontFamily.sans.join(', '),
    fontSize: 14,
    controlHeight: 36,
  },
  components: {
    Layout: {
      headerBg: papeis.corSuperficie,
      headerColor: papeis.corTextoForte,
      bodyBg: papeis.corFundoApp,
      siderBg: papeis.corSuperficie,
    },
    Menu: {
      itemSelectedBg: primary[50],
      itemSelectedColor: primary[700],
    },
    Table: {
      headerBg: neutral[50],
      headerColor: papeis.corTextoSecundario,
    },
  },
};
