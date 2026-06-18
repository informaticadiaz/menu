import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { initDb, schema } from './schema';

const SEED_ADMIN_EMAIL = 'admin@fuego-ba.com';
const SEED_ADMIN_PASSWORD = 'fuego1234';

export function initializeDB(): void {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const db = initDb();
  db.exec(schema.restaurants);
  db.exec(schema.menu_items);
  db.exec(schema.admin_users);
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
