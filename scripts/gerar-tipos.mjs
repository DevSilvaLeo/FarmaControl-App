// Gera src/tipos/api.gerado.ts a partir do swagger.json do backend.
// URL configurável por env: SWAGGER_URL (completa) ou API_HOST (base, sem /api).
// Padrão: http://localhost:5138
import { execFileSync } from 'node:child_process';

const host = (process.env.API_HOST || 'http://localhost:5138').replace(/\/+$/, '').replace(/\/api$/, '');
const url = process.env.SWAGGER_URL || `${host}/swagger/v1/swagger.json`;

console.log(`> openapi-typescript ${url}`);
execFileSync('npx', ['openapi-typescript', url, '-o', 'src/tipos/api.gerado.ts'], {
  stdio: 'inherit',
  shell: true,
});
