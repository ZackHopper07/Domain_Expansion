# Builds the React site and serves it with nginx.
# nginx also forwards /api requests to the FastAPI backend, so the browser
# only ever talks to one address and no API keys reach the frontend.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Talk to the real backend on the same address (through nginx), not mock data.
ENV VITE_USE_MOCK=false \
    VITE_API_BASE_URL=""
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
