FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json* .npmrc ./
RUN npm ci
COPY public ./public
COPY src ./src
ARG REACT_APP_BACKEND_URL=http://localhost:4000
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
