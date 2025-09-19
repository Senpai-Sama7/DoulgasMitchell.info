FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --production

# Copy source
COPY . .

# Build admin bundle (Payload builds admin on-demand; no separate build step needed if config is JS)
# Expose port
EXPOSE 3001

# Start: run seed (idempotent) then start server
CMD node seed.mjs && node server.mjs
