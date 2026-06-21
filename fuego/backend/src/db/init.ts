import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initDb, schema } from './schema';

const SEED_ADMIN_EMAIL = 'admin@fuego-ba.com';
const SEED_ADMIN_PASSWORD = 'fuego1234';
const DEV_SYSTEM_ADMIN_EMAIL = 'system@fuego.local';
const DEV_SYSTEM_ADMIN_PASSWORD = 'system1234';

function ensureColumn(db: ReturnType<typeof initDb>, table: string, column: string, definition: string): void {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((existing) => existing.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function seedSystemAdmin(db: ReturnType<typeof initDb>): void {
  const existing = db.prepare('SELECT 1 FROM system_admin_users LIMIT 1').get();
  if (existing) return;

  const email = process.env.SYSTEM_ADMIN_EMAIL || (process.env.NODE_ENV === 'production' ? null : DEV_SYSTEM_ADMIN_EMAIL);
  const password = process.env.SYSTEM_ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? null : DEV_SYSTEM_ADMIN_PASSWORD);

  if (!email || !password) {
    throw new Error('SYSTEM_ADMIN_EMAIL y SYSTEM_ADMIN_PASSWORD son obligatorios en producción');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO system_admin_users (email, password_hash) VALUES (?, ?)').run(email, passwordHash);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔐 Admin interno de desarrollo: ${email} / ${password}`);
  }
}

export function initializeDB(): void {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const db = initDb();
  db.exec(schema.restaurants);
  ensureColumn(db, 'restaurants', 'status', "TEXT NOT NULL DEFAULT 'active'");
  db.exec(schema.menu_items);
  db.exec(schema.admin_users);
  db.exec(schema.system_admin_users);
  seedSystemAdmin(db);
  console.log('✅ Database initialized');
}

export function seedDatabase(): void {
  const db = initDb();
  try {
    const restaurantStmt = db.prepare(
      'INSERT OR IGNORE INTO restaurants (name, slug, description, created_at) VALUES (?, ?, ?, ?)'
    );
    restaurantStmt.run(
      'Fuego - Buenos Aires', 'fuego-ba',
      'Fast casual argentino con las mejores carnes',
      new Date().toISOString()
    );
    const restaurant = db.prepare('SELECT id FROM restaurants WHERE slug = ?').get('fuego-ba') as { id: number };
    const itemStmt = db.prepare(
      'INSERT OR IGNORE INTO menu_items (restaurant_id, name, category, description, price) VALUES (?, ?, ?, ?, ?)'
    );
    const items = [
      [restaurant.id, 'Burger Triple', 'Burgers', 'Carnes de primera, lechuga, tomate', 850],
      [restaurant.id, 'Burger Clásico', 'Burgers', 'Carne, queso cheddar, cebolla', 650],
      [restaurant.id, 'Ensalada César', 'Ensaladas', 'Lechuga, parmesano, croutons', 550],
      [restaurant.id, 'Agua Mineral 500ml', 'Bebidas', 'Agua mineral sin gas', 100],
    ];
    items.forEach(item => itemStmt.run(...item));

    const passwordHash = bcrypt.hashSync(SEED_ADMIN_PASSWORD, 10);
    db.prepare(
      'INSERT OR IGNORE INTO admin_users (restaurant_id, email, password_hash) VALUES (?, ?, ?)'
    ).run(restaurant.id, SEED_ADMIN_EMAIL, passwordHash);

    console.log('✅ Database seeded with example data');
    console.log(`🔑 Admin de ejemplo: ${SEED_ADMIN_EMAIL} / ${SEED_ADMIN_PASSWORD}`);
  } catch (error) {
    console.log('ℹ️ Seed data already exists or error:', error);
  }
}

if (process.argv[1] && process.argv[1].endsWith('init.ts')) {
  initializeDB();
  seedDatabase();
}
