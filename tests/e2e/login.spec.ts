import { test, expect } from '@playwright/test';

/**
 * Fluxo crítico: login por senha (`.spec/03` §3.12, `.spec/06` §6.11).
 *
 * Homologação — bloco 1: o backend roda com `Autenticacao:DoisFatoresHabilitado=false`,
 * então o login por senha SEMPRE vai direto ao Painel (nunca ao desafio TOTP) e a
 * autogestão de 2FA some de "Minha Conta" (`VITE_2FA_VISIVEL=off`).
 *
 * Roda contra uma API real (`.spec/12` D-12) — não `msw`. Precisa de `E2E_BASE_URL`
 * (frontend; padrão: o container em :8080) e de um usuário conhecido em
 * `E2E_LOGIN` / `E2E_SENHA`. Sem essas variáveis o teste é pulado.
 */
const temAmbiente = !!process.env.E2E_LOGIN && !!process.env.E2E_SENHA;

test.describe('Autenticação — login sem 2FA (homologação)', () => {
  test.skip(!temAmbiente, 'defina E2E_LOGIN e E2E_SENHA (e suba a API + o frontend)');

  test('login com senha leva direto ao Painel', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('Login').fill(process.env.E2E_LOGIN!);
    await page.getByLabel('Senha').fill(process.env.E2E_SENHA!);
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 2FA desligado: vai direto ao Painel, nunca ao desafio.
    await expect(page).toHaveURL(/\/$/);
    await expect(page).not.toHaveURL(/dois-fatores/);
    await expect(page.getByRole('heading', { name: 'Painel' })).toBeVisible();
  });

  test('credenciais inválidas mostram mensagem', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('Login').fill('usuario-inexistente');
    await page.getByLabel('Senha').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Login ou senha inválidos.')).toBeVisible();
  });

  test('Minha Conta não mostra a autogestão de 2FA', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('Login').fill(process.env.E2E_LOGIN!);
    await page.getByLabel('Senha').fill(process.env.E2E_SENHA!);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/minha-conta');
    await expect(page.getByRole('heading', { name: 'Minha Conta' })).toBeVisible();
    await expect(page.getByText('Verificação em duas etapas')).toHaveCount(0);
  });
});
