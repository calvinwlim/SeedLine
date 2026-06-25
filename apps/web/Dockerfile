# Build from the repository root:
#   docker build -f apps/web/Dockerfile -t seedline-web .

FROM node:20-slim AS base
WORKDIR /app

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm ci
RUN npx turbo run build --filter=@seedline/web

FROM base AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# Next's standalone output bundles the server and only the node_modules it needs.
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
