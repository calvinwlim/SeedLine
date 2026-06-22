# Build from the repository root:
#   docker build -f apps/api/Dockerfile -t openmat-api .

# ---- Base ----
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /app

# ---- Build ----
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
# Turbo builds workspace dependencies (bracket-engine, types) before the API.
RUN pnpm exec turbo run build --filter=@openmat/api
# Drop dev dependencies to slim the runtime image.
RUN pnpm prune --prod

# ---- Runtime ----
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]
