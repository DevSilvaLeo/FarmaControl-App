import { test, expect, type Page } from '@playwright/test';

/**
 * Homologação — bloco 4: cada persona loga e só acessa **as telas dela**.
 *
 * Testa a guarda de rota (`GuardaPermissao`) — a fronteira real de RBAC no
 * frontend: rota permitida renderiza a tela; rota sem permissão mostra
 * "Acesso negado" (nunca redirect silencioso).
 *
 * Depende do seed de homologação do backend (`Seed:Homologacao=true`), que cria
 * 1 usuário por perfil com a senha de `SeedHomologacao:Senha`. Passe-a em
 * `E2E_PERSONAS_SENHA` (padrão do dev: `Homolog@123`); sem ela o teste é pulado.
 */
const SENHA = process.env.E2E_PERSONAS_SENHA;

type Caso = {
  login: string;
  permitidas: string[];
  bloqueadas: string[];
};

const PERSONAS: Caso[] = [
  {
    login: 'gestor.estoque',
    permitidas: [
      '/estoque/entrada',
      '/estoque/saida',
      '/estoque/ajuste',
      '/estoque/posicao',
      '/estoque/kardex',
      '/estoque/depositos',
      '/estoque/parametros',
      '/estoque/centros-custo',
      '/produtos',
    ],
    bloqueadas: ['/sistema/usuarios', '/clientes', '/vendedores'],
  },
  {
    login: 'op.entrada',
    permitidas: ['/estoque/entrada', '/estoque/posicao', '/estoque/kardex', '/estoque/depositos'],
    bloqueadas: ['/estoque/saida', '/estoque/ajuste', '/estoque/centros-custo', '/produtos', '/sistema/usuarios'],
  },
  {
    login: 'op.saida',
    permitidas: ['/estoque/saida', '/estoque/posicao', '/estoque/kardex'],
    bloqueadas: ['/estoque/entrada', '/estoque/ajuste', '/estoque/centros-custo', '/sistema/usuarios'],
  },
  {
    login: 'op.ajuste',
    permitidas: ['/estoque/ajuste', '/estoque/posicao', '/estoque/kardex'],
    bloqueadas: ['/estoque/entrada', '/estoque/saida', '/sistema/usuarios'],
  },
  {
    login: 'consulta.estoque',
    permitidas: ['/estoque/posicao', '/estoque/kardex', '/estoque/lotes-a-vencer', '/estoque/depositos'],
    bloqueadas: ['/estoque/entrada', '/estoque/saida', '/estoque/ajuste', '/estoque/centros-custo', '/produtos'],
  },
  {
    login: 'cadastro.produtos',
    permitidas: ['/produtos', '/cadastros/apoio', '/fornecedores', '/estoque/centros-custo'],
    bloqueadas: ['/estoque/entrada', '/estoque/posicao', '/sistema/usuarios', '/clientes'],
  },
  {
    login: 'admin.acesso',
    permitidas: ['/sistema/usuarios', '/sistema/perfis'],
    bloqueadas: ['/estoque/posicao', '/produtos', '/estoque/centros-custo', '/sistema/empresas'],
  },
];

async function entrar(page: Page, login: string) {
  await page.goto('/entrar');
  await page.getByLabel('Login').fill(login);
  await page.getByLabel('Senha').fill(SENHA!);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe('Personas de homologação — guardas de rota por permissão', () => {
  test.skip(!SENHA, 'defina E2E_PERSONAS_SENHA e suba API (Seed:Homologacao) + frontend');

  for (const caso of PERSONAS) {
    test(`${caso.login}: acessa o que lhe cabe e é barrado no resto`, async ({ page }) => {
      await entrar(page, caso.login);

      for (const rota of caso.permitidas) {
        await page.goto(rota);
        await expect(page, `${caso.login} deveria acessar ${rota}`).toHaveURL(
          new RegExp(rota.replace(/\//g, '\\/')),
        );
        await expect(page.getByText('Acesso negado'), `${caso.login} foi barrado em ${rota}`).toHaveCount(0);
      }

      for (const rota of caso.bloqueadas) {
        await page.goto(rota);
        await expect(
          page.getByText('Acesso negado'),
          `${caso.login} NÃO deveria acessar ${rota}`,
        ).toBeVisible();
      }
    });
  }
});
