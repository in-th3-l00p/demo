import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const projects = [
  { name: 'MPC server', dir: resolve(root, 'submodules/panoplia.mpc') },
  { name: 'App', dir: resolve(root, 'app') },
];

for (const { name, dir } of projects) {
  const nm = resolve(dir, 'node_modules');
  if (existsSync(nm)) continue;

  console.log(`[setup] Installing ${name} dependencies...`);
  execSync('npm install', { cwd: dir, stdio: 'inherit' });
}
