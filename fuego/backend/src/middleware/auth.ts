import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../auth';

export interface AuthPayload {
  adminId: number;
  restaurantId: number;
}

export async function authMiddleware(c: Context, next: Next) {
  const header = c.req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
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
