export function getRequiredEnvVar(key: string): string {
  if (!process.env[key]) throw new Error(key + ' is missing');
  return process.env[key]!;
}
