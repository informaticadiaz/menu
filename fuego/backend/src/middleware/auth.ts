import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import { getJwtSecret, SESSION_COOKIE_NAME } from '../auth';

export interface AuthPayload {
  adminId: number;
  restaurantId: number;
}

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return c.json({ error: 'No autorizado' }, 401);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as unknown as AuthPayload;
    c.set('adminId', payload.adminId);
    c.set('restaurantId', payload.restaurantId);
  } catch {
    return c.json({ error: 'No autorizado' }, 401);
  }
  await next();
}
