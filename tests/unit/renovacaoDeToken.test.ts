const { postSpy } = vi.hoisted(() => ({ postSpy: vi.fn() }));

vi.mock('axios', () => ({
  default: { create: () => ({ post: postSpy }) },
}));

import { renovarAccessToken, _renovacaoPendente } from '@/compartilhado/api/renovacaoDeToken';
import { useSessaoStore } from '@/compartilhado/auth/sessaoStore';

beforeEach(() => {
  postSpy.mockReset();
  useSessaoStore.getState().limpar();
});

describe('renovacaoDeToken — single-flight (.spec/05 §5.2)', () => {
  it('duas renovações concorrentes disparam UMA chamada e compartilham o resultado', async () => {
    useSessaoStore.getState().definirTokens({ accessToken: 'a0', refreshToken: 'r0' });
    postSpy.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { accessToken: 'a1', refreshToken: 'r1' } }), 20),
        ),
    );

    const [t1, t2] = await Promise.all([renovarAccessToken(), renovarAccessToken()]);

    expect(t1).toBe('a1');
    expect(t2).toBe('a1');
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(useSessaoStore.getState().accessToken).toBe('a1');
    expect(useSessaoStore.getState().refreshToken).toBe('r1');
    expect(_renovacaoPendente()).toBe(false);
  });

  it('após concluir, uma nova renovação dispara outra chamada', async () => {
    useSessaoStore.getState().definirTokens({ accessToken: 'a0', refreshToken: 'r0' });
    postSpy.mockResolvedValue({ data: { accessToken: 'aX', refreshToken: 'rX' } });

    await renovarAccessToken();
    await renovarAccessToken();

    expect(postSpy).toHaveBeenCalledTimes(2);
  });

  it('sem refresh token → rejeita sem chamar a API', async () => {
    await expect(renovarAccessToken()).rejects.toThrow();
    expect(postSpy).not.toHaveBeenCalled();
  });
});
