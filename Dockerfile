# ===== STAGE 1: build =====
FROM node:20-alpine AS build

WORKDIR /app

# Copia apenas arquivos de dependência primeiro (cache)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN npm install

# Copia o resto do projeto
COPY . .

# Build do Vite
RUN npm run build


# ===== STAGE 2: production =====
FROM nginx:alpine

# Remove config default
RUN rm /etc/nginx/conf.d/default.conf

# Copia config custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build do Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
