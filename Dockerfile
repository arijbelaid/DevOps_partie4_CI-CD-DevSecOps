# Étape 1 : Dépendances
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Étape 2 : Image finale (Runtime)
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# On copie les node_modules et le code
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

# Sécurité : Utilisateur non-root
USER node

# Exposition du port
EXPOSE 3000

# Healthcheck (adapté à ta route /api/health)
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Démarrage de l'API
CMD ["npm", "start"]
