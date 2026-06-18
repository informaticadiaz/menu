#!/bin/bash
set -e

echo "🔥 Creando repo completo de Fuego..."

# === ESTRUCTURA BASE ===
mkdir -p fuego/backend/src/{routes,db,middleware}
mkdir -p fuego/backend/uploads
mkdir -p fuego/backend/data
cd fuego

# === FRONTEND (Next.js) ===
npx create-next-app@latest frontend \
  --typescript --tailwind --eslint --app --no-git \
  --import-alias '@/*'

# === BACKEND: package.json ===
cat > backend/package.json << 'EOF'
{
  "name": "fuego-backend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "tsx src/db/init.ts"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.0",
    "better-sqlite3": "^9.2.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "@types/node": "^20.10.6",
    "@types/better-sqlite3": "^7.6.8"
  }
}
EOF

# === BACKEND: tsconfig.json ===
cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF

# === BACKEND: src/db/schema.ts ===
cat > backend/src/db/schema.ts << 'EOF'
import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function initDb(): Database.Database {
  if (db) return db;
  const dbPath = path.join(process.cwd(), 'data', 'fuego.db');
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  return db;
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export const schema = {
  restaurants: `
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `,
  menu_items: `
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      available BOOLEAN DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    )
  `,
  admin_users: `
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    )
  `,
};
EOF

# === BACKEND: src/db/init.ts ===
cat > backend/src/db/init.ts << 'EOF'
import fs from 'fs';
import path from 'path';
import { initDb, schema } from './schema';

export function initializeDB(): void {
  const db = initDb();
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
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
    console.log('✅ Database seeded with example data');
  } catch (error) {
    console.log('ℹ️ Seed data already exists or error:', error);
  }
}
EOF

# === BACKEND: src/index.ts ===
cat > backend/src/index.ts << 'EOF'
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import { initializeDB } from './db/init';
import { getDb } from './db/schema';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const app = new Hono();

app.use('*', cors({
  origin: ['http://localhost:3000', process.env.FRONTEND_URL || '*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/uploads/*', serveStatic({ root: './' }));

initializeDB();
const db = getDb();
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

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

app.post('/api/restaurants', async (c) => {
  try {
    const { name, slug } = await c.req.json();
    if (!name || !slug) return c.json({ error: 'name y slug requeridos' }, 400);
    const stmt = db.prepare('INSERT INTO restaurants (name, slug, created_at) VALUES (?, ?, ?)');
    const result = stmt.run(name, slug, new Date().toISOString());
    return c.json({ id: result.lastInsertRowid, name, slug }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/menu/:slug', (c) => {
  try {
    const slug = c.req.param('slug');
    const restaurant = db.prepare('SELECT id FROM restaurants WHERE slug = ?').get(slug) as { id: number } | undefined;
    if (!restaurant) return c.json({ error: 'Restaurante no encontrado' }, 404);
    const items = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name').all(restaurant.id);
    return c.json({ restaurant_id: restaurant.id, items });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/menu-items', async (c) => {
  try {
    const { restaurant_id, name, category, description, price, image_url } = await c.req.json();
    if (!restaurant_id || !name || !price) return c.json({ error: 'Campos requeridos faltando' }, 400);
    const stmt = db.prepare(
      'INSERT INTO menu_items (restaurant_id, name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(restaurant_id, name, category || 'General', description || '', price, image_url || null);
    return c.json({ id: result.lastInsertRowid, restaurant_id, name, category, description, price, image_url }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/api/menu-items/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const allowedFields = ['name', 'category', 'description', 'price', 'image_url'];
    const validUpdates = Object.fromEntries(Object.entries(updates).filter(([key]) => allowedFields.includes(key)));
    if (Object.keys(validUpdates).length === 0) return c.json({ error: 'Sin campos para actualizar' }, 400);
    const setClauses = Object.keys(validUpdates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(validUpdates);
    const stmt = db.prepare(`UPDATE menu_items SET ${setClauses}, updated_at = ? WHERE id = ?`);
    stmt.run(...values, new Date().toISOString(), id);
    return c.json({ success: true, id });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/api/menu-items/:id', (c) => {
  try {
    const id = c.req.param('id');
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

export default app;
EOF

# === BACKEND: Dockerfile ===
cat > backend/Dockerfile << 'EOF'
FROM node:20-alpine AS builder
WORKDIR /app/backend
COPY package*.json ./
RUN npm ci
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app/backend
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/backend/dist ./dist
RUN mkdir -p /app/backend/data /app/backend/uploads
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["node", "dist/index.js"]
EOF

# === FRONTEND: Dockerfile ===
cat > frontend/Dockerfile << 'EOF'
FROM node:20-alpine AS builder
WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app/frontend
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1
CMD ["npm", "start"]
EOF

# === ROOT: docker-compose.yml ===
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
    volumes:
      - ./backend/data:/app/backend/data
      - ./backend/uploads:/app/backend/uploads
    restart: unless-stopped
    networks:
      - fuego-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NODE_ENV: production
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - fuego-network

networks:
  fuego-network:
    driver: bridge
EOF

# === ROOT: .env.example ===
cat > .env.example << 'EOF'
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
# Producción:
# NEXT_PUBLIC_API_URL=https://api.tudominio.com
# FRONTEND_URL=https://tudominio.com
EOF

# === ROOT: .gitignore ===
cat > .gitignore << 'EOF'
node_modules/
package-lock.json
yarn.lock
backend/dist/
backend/data/
backend/uploads/
frontend/.next/
frontend/out/
.env
.env.local
.env.*.local
.DS_Store
.vscode/
.idea/
*.swp
*.log
backup/
*.db.bak
EOF

# === ROOT: README.md (resumido, ver versión completa en el chat) ===
cat > README.md << 'EOF'
# 🔥 FUEGO - Menú Digital Hiperlocal

Plataforma de menús digitales para restaurantes pequeños. Backend ligero (Hono + SQLite), corre en cualquier VPS.

## Stack
- Frontend: Next.js 15 + Tailwind
- Backend: Hono + better-sqlite3
- Deploy: Docker + docker-compose

## Desarrollo local

```bash
cd backend && npm install && npm run dev   # puerto 3001
cd frontend && npm install && npm run dev  # puerto 3000
```

## Deploy

```bash
docker-compose up -d
```

EOF

echo ""
echo "✅ Repo listo en ./fuego"
