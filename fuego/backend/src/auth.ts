export const SESSION_COOKIE_NAME = 'fuego_session';
export const SYSTEM_SESSION_COOKIE_NAME = 'fuego_system_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días, igual a la expiración del JWT

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET es obligatorio en producción');
  }
  return 'dev-secret-do-not-use-in-production';
}

export function getSystemJwtSecret(): string {
  const secret = process.env.SYSTEM_JWT_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SYSTEM_JWT_SECRET o JWT_SECRET es obligatorio en producción');
  }
  return 'dev-system-secret-do-not-use-in-production';
}
