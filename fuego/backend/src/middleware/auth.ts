import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/schema';
import { getJwtSecret, getSystemJwtSecret, SESSION_COOKIE_NAME, SYSTEM_SESSION_COOKIE_NAME } from '../auth';

export interface AuthPayload {
  adminId: number;
  restaurantId: number;
}

export interface SystemAuthPayload {
  systemAdminId: number;
}

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return c.json({ error: 'No autorizado' }, 401);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as unknown as AuthPayload;
    const restaurant = getDb().prepare('SELECT status FROM restaurants WHERE id = ?').get(payload.restaurantId) as
      | { status: string }
      | undefined;
    if (!restaurant) return c.json({ error: 'No autorizado' }, 401);
    if (restaurant.status === 'paused') return c.json({ error: 'Cuenta pausada' }, 403);
    c.set('adminId', payload.adminId);
    c.set('restaurantId', payload.restaurantId);
  } catch {
    return c.json({ error: 'No autorizado' }, 401);
  }
  await next();
}

export async function systemAuthMiddleware(c: Context, next: Next) {
  const token = getCookie(c, SYSTEM_SESSION_COOKIE_NAME);
  if (!token) return c.json({ error: 'No autorizado' }, 401);
  try {
    const payload = jwt.verify(token, getSystemJwtSecret()) as unknown as SystemAuthPayload;
    const admin = getDb().prepare('SELECT id FROM system_admin_users WHERE id = ?').get(payload.systemAdminId);
    if (!admin) return c.json({ error: 'No autorizado' }, 401);
    c.set('systemAdminId', payload.systemAdminId);
  } catch {
    return c.json({ error: 'No autorizado' }, 401);
  }
  await next();
}
