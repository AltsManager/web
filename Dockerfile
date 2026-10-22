FROM node:25-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:25-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

FROM node:25-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node

EXPOSE 3000
# HOSTNAME must be the IPv6 wildcard, not 0.0.0.0 -- Datum Compute's network
# is IPv6-only, and 0.0.0.0 binds IPv4 only (see AltsManager/api's DEPLOY.md
# "Gotchas" for the same issue hit there with uvicorn).
ENV PORT=3000 HOSTNAME=::
CMD ["node", "server.js"]
