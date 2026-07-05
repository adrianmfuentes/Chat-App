FROM node:20-bookworm-slim AS deps
WORKDIR /app
# better-sqlite3 falls back to compiling from source when no prebuilt binary
# matches this platform/ABI; build tools live only in this stage.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 4000
CMD ["node", "src/index.js"]
