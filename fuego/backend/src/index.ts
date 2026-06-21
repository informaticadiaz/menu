import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { setCookie, deleteCookie } from 'hono/cookie';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { initializeDB } from './db/init';
import { getDb } from './db/schema';
import { getJwtSecret, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from './auth';
import { authMiddleware } from './middleware/auth';
import { slugify, isValidSlug, resolveAvailableSlug } from './slug';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const app = new Hono<{ Variables: { adminId: number; restaurantId: number } }>();

const ALLOWED_ORIGINS = [process.env.FRONTEND_URL || 'http://localhost:3000'];

app.use('*', cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type'],
}));

app.use('/uploads/*', serveStatic({ root: './' }));

initializeDB();
const db = getDb();
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DAILY_SIGNUP_LIMIT_MESSAGE = 'Solo se puede crear una cuenta nueva por día';

function getUtcDayRange(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function hasRestaurantCreatedToday() {
  const { startIso, endIso } = getUtcDayRange();
  return Boolean(
    db
      .prepare('SELECT 1 FROM restaurants WHERE created_at >= ? AND created_at < ? LIMIT 1')
      .get(startIso, endIso)
  );
}

app.get('/health', (c) => c.json({ status: 'ok' }));

app.post('/api/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'Archivo requerido (campo "file")' }, 400);
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Formato no permitido. Usar JPG, PNG o WEBP' }, 400);
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: 'Archivo muy pesado (máximo 5MB)' }, 400);
    }
    await mkdir(UPLOADS_DIR, { recursive: true });
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);
    return c.json({ url: `/uploads/${filename}` }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: 'email y password requeridos' }, 400);
    }
    const admin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email) as
      | { id: number; restaurant_id: number; password_hash: string }
      | undefined;
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }
    const token = jwt.sign(
      { adminId: admin.id, restaurantId: admin.restaurant_id },
      getJwtSecret(),
      { expiresIn: '7d' }
    );
    setCookie(c, SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/auth/logout', (c) => {
  deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
  return c.json({ success: true });
});

app.get('/api/auth/me', authMiddleware, (c) => {
  return c.json({ restaurantId: c.get('restaurantId') });
});

app.get('/api/admin/menu', authMiddleware, (c) => {
  try {
    const restaurantId = c.get('restaurantId');
    const items = db
      .prepare('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name')
      .all(restaurantId);
    return c.json({ items });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/auth/signup', async (c) => {
  try {
    const { restaurantName, slug, email, password } = await c.req.json();
    if (!restaurantName || !email || !password) {
      return c.json({ error: 'restaurantName, email y password requeridos' }, 400);
    }

    if (hasRestaurantCreatedToday()) {
      return c.json({ error: DAILY_SIGNUP_LIMIT_MESSAGE }, 429);
    }

    const existingAdmin = db.prepare('SELECT 1 FROM admin_users WHERE email = ?').get(email);
    if (existingAdmin) return c.json({ error: 'El email ya está registrado' }, 409);

    let finalSlug: string;
    if (slug) {
      if (!isValidSlug(slug)) {
        return c.json({ error: 'Formato de slug inválido' }, 400);
      }
      const slugTaken = db.prepare('SELECT 1 FROM restaurants WHERE slug = ?').get(slug);
      if (slugTaken) return c.json({ error: 'El slug ya está en uso' }, 409);
      finalSlug = slug;
    } else {
      finalSlug = resolveAvailableSlug(slugify(restaurantName));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const signupTx = db.transaction(() => {
      if (hasRestaurantCreatedToday()) {
        throw new Error(DAILY_SIGNUP_LIMIT_MESSAGE);
      }
      const restaurantResult = db
        .prepare('INSERT INTO restaurants (name, slug, created_at) VALUES (?, ?, ?)')
        .run(restaurantName, finalSlug, now);
      const restaurantId = restaurantResult.lastInsertRowid as number;
      const adminResult = db
        .prepare('INSERT INTO admin_users (restaurant_id, email, password_hash) VALUES (?, ?, ?)')
        .run(restaurantId, email, passwordHash);
      return { restaurantId, adminId: adminResult.lastInsertRowid as number };
    });

    const { restaurantId, adminId } = signupTx();
    const token = jwt.sign({ adminId, restaurantId }, getJwtSecret(), { expiresIn: '7d' });
    setCookie(c, SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return c.json(
      { restaurant: { id: restaurantId, name: restaurantName, slug: finalSlug } },
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message === DAILY_SIGNUP_LIMIT_MESSAGE) {
      return c.json({ error: DAILY_SIGNUP_LIMIT_MESSAGE }, 429);
    }
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/menu/:slug', (c) => {
  try {
    const slug = c.req.param('slug');
    const restaurant = db.prepare('SELECT id, name FROM restaurants WHERE slug = ?').get(slug) as
      | { id: number; name: string }
      | undefined;
    if (!restaurant) return c.json({ error: 'Restaurante no encontrado' }, 404);
    const items = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name').all(restaurant.id);
    return c.json({ restaurant_id: restaurant.id, restaurant_name: restaurant.name, items });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/menu-items/:id', (c) => {
  try {
    const id = c.req.param('id');
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    if (!item) return c.json({ error: 'Item no encontrado' }, 404);
    return c.json(item);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/menu-items', authMiddleware, async (c) => {
  try {
    const restaurantId = c.get('restaurantId');
    const { name, category, description, price, image_url } = await c.req.json();
    if (!name || !price) return c.json({ error: 'Campos requeridos faltando' }, 400);
    const stmt = db.prepare(
      'INSERT INTO menu_items (restaurant_id, name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(restaurantId, name, category || 'General', description || '', price, image_url || null);
    return c.json({ id: result.lastInsertRowid, restaurant_id: restaurantId, name, category, description, price, image_url }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/api/menu-items/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const restaurantId = c.get('restaurantId');
    const existing = db.prepare('SELECT restaurant_id FROM menu_items WHERE id = ?').get(id) as
      | { restaurant_id: number }
      | undefined;
    if (!existing) return c.json({ error: 'Item no encontrado' }, 404);
    if (existing.restaurant_id !== restaurantId) return c.json({ error: 'Prohibido' }, 403);
    const updates = await c.req.json();
    const allowedFields = ['name', 'category', 'description', 'price', 'image_url', 'available'];
    const validUpdates = Object.fromEntries(Object.entries(updates).filter(([key]) => allowedFields.includes(key)));
    if (Object.keys(validUpdates).length === 0) return c.json({ error: 'Sin campos para actualizar' }, 400);
    const setClauses = Object.keys(validUpdates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(validUpdates).map(v => typeof v === 'boolean' ? Number(v) : v);
    const stmt = db.prepare(`UPDATE menu_items SET ${setClauses}, updated_at = ? WHERE id = ?`);
    stmt.run(...values, new Date().toISOString(), id);
    return c.json({ success: true, id });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/api/menu-items/:id', authMiddleware, (c) => {
  try {
    const id = c.req.param('id');
    const restaurantId = c.get('restaurantId');
    const existing = db.prepare('SELECT restaurant_id FROM menu_items WHERE id = ?').get(id) as
      | { restaurant_id: number }
      | undefined;
    if (!existing) return c.json({ error: 'Item no encontrado' }, 404);
    if (existing.restaurant_id !== restaurantId) return c.json({ error: 'Prohibido' }, 403);
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port });
console.log(`🔥 Fuego backend running on port ${port}`);

export default app;
