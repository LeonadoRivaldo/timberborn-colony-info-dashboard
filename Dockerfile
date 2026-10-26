FROM node:24-bookworm-slim AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:24-bookworm-slim AS backend-build
WORKDIR /workspace/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=7000 \
    WEB_ROOT=/app/frontend
WORKDIR /app
COPY --from=backend-build --chown=node:node /workspace/backend/package.json ./package.json
COPY --from=backend-build --chown=node:node /workspace/backend/node_modules ./node_modules
COPY --from=backend-build --chown=node:node /workspace/backend/dist ./dist
COPY --from=frontend-build --chown=node:node /workspace/frontend/dist/colony-info/browser ./frontend
USER node
EXPOSE 7000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:7000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/main.js"]