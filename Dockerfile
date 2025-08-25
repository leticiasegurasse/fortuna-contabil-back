# Etapa de build
FROM node:20-alpine AS build

# Instalar dependências necessárias para compilação
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Etapa de produção
FROM node:20-alpine AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copiar package.json e instalar apenas dependências de produção
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar build da etapa anterior
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Expor porta
EXPOSE 3000

# Mudar para usuário não-root
USER nodejs

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]
