import { config } from 'dotenv';
export const nodeEnv = process.env.NODE_ENV || 'development';
// 开发环境使用 .env
if (nodeEnv == 'development') {
  config({ path: process.cwd() + '/.env.development.local' });
  config({ path: process.cwd() + '/.env.development' });
}
