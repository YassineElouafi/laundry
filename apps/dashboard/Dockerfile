# Laundry dashboard — Vite SPA served by nginx. Build context must be the REPO ROOT.
# NOTE: Vite inlines VITE_API_URL at BUILD time, so it is passed as a build arg, not a
# runtime env. Changing the API URL requires a rebuild + redeploy.
FROM node:22-bookworm-slim AS build
RUN npm install -g pnpm@10.16.1
WORKDIR /repo

COPY . .

# "@laundry/dashboard..." pulls in the dashboard AND its workspace dep @laundry/shared.
RUN pnpm install --frozen-lockfile --filter @laundry/dashboard...

# The dashboard's `tsc -b` step resolves @laundry/shared types from its compiled dist,
# so build the shared package before building the dashboard. (Vite itself aliases the
# package to its TS source, but tsc needs the .d.ts.)
RUN pnpm --filter @laundry/shared build

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @laundry/dashboard build

# ---- serve ----
FROM nginx:1.27-alpine
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/dashboard/dist /usr/share/nginx/html
EXPOSE 80
