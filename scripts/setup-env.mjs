import { existsSync, writeFileSync, readFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../submodules/panoplia.mpc/.env');
const examplePath = resolve(__dirname, '../submodules/panoplia.mpc/.env.example');

if (existsSync(envPath)) {
  process.exit(0);
}

console.log('[setup] Generating .env for MPC server...');

const jwtSecret = randomBytes(32).toString('hex');
const masterKey = randomBytes(32).toString('hex');

let content;
if (existsSync(examplePath)) {
  content = readFileSync(examplePath, 'utf-8')
    .replace('change-me-to-a-random-secret', jwtSecret)
    .replace('0000000000000000000000000000000000000000000000000000000000000000', masterKey)
    .replace('DEMO_MODE=false', 'DEMO_MODE=true');
} else {
  content = `PORT=3000
NODE_ENV=development
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SERVER_MASTER_KEY=${masterKey}
DB_PATH=./data/panoplia.db
VULTISIG_RELAY_URL=https://api.vultisig.com
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
DEMO_MODE=true
`;
}

writeFileSync(envPath, content);
console.log('[setup] .env created with random secrets and DEMO_MODE=true');
