import { papeis, primary, semaforoValidade } from '@/compartilhado/tema/tokens';
import { temaAntd } from '@/compartilhado/tema/temaAntd';

describe('Tokens de design (fonte única — agents.md §5.1.3)', () => {
  it('a cor primária do tema antd vem dos tokens', () => {
    expect(temaAntd.token?.colorPrimary).toBe(primary[600]);
    expect(papeis.corPrimaria).toBe('#1663B3');
  });

  it('o semáforo de validade tem as 5 faixas', () => {
    expect(Object.keys(semaforoValidade)).toEqual(['vencido', 'ate7', 'ate30', 'ate90', 'acima90']);
  });
});
