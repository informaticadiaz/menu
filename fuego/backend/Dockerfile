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
