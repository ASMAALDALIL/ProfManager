# Étape 1 : Build de l'application avec Node
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Argument injecté lors du docker build pour l'URL de l'API
ARG VITE_API_URL=http://host.docker.internal:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Étape 2 : Serveur web de production Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]