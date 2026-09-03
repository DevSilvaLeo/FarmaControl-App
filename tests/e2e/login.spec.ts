import { test, expect } from '@playwright/test';

/**
 * Fluxo crítico: login completo (`.spec/03` §3.12, `.spec/06` §6.11).
 *
 * Roda contra uma **API de teste real** (`.spec/12` D-12) — não `msw`. Precisa
 * de `E2E_BASE_URL` (frontend) e de uma API no ar com um usuário conhecido em
 * `E2E_LOGIN` / `E2E_SENHA`. Sem essas variáveis o teste é pulado.
 */
const temAmbiente = !!process.env.E2E_LOGIN && !!process.env.E2E_SENHA;

test.describe('Autenticação', () => {
  test.skip(!temAmbiente, 'defina E2E_LOGIN e E2E_SENHA (e suba a API de teste)');

  test('login com senha leva ao Painel', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('Login').fill(process.env.E2E_LOGIN!);
    await page.getByLabel('Senha').fill(process.env.E2E_SENHA!);
    await page.getByRole('button', { name: 'Entrar' }).click();

    // ou vai direto ao Painel, ou passa pelo desafio TOTP (fora do escopo aqui)
    await expect(page).toHaveURL(/\/($|entrar\/dois-fatores)/);
  });

  test('credenciais inválidas mostram mensagem', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('Login').fill('usuario-inexistente');
    await page.getByLabel('Senha').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Login ou senha inválidos.')).toBeVisible();
  });
});
