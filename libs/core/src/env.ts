export function requireEnv(key: string): string {
  const str = env(key);
  if (!str) {
    throw new Error(`env.${key} required`);
  }
  return str;
}

export function env(key: string): string {
  return process.env[key];
}
