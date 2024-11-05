FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Étape 2: Servir l'application avec NGINX
FROM nginx:alpine

# Copie des fichiers de build
COPY --from=build /app/dist/frontend-app/browser/ /usr/share/nginx/html/


EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]