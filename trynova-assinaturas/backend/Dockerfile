FROM node:20-alpine

WORKDIR /app

# Copia package.json e instala dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copia o código-fonte do backend e assets
COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]
