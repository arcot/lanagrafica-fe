# Stage 1: Build the production-ready React app
FROM node:20 AS build
WORKDIR /app
COPY package.json .
COPY pnpm-lock.json .
RUN pnpm install
COPY . .
RUN pnpm run build

# Stage 2: Serve the built app using a lightweight HTTP server
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/nginx.conf
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
