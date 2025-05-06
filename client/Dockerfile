FROM node:22-alpine

WORKDIR /app/frontend

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]

# Optional: Add health check for Docker
HEALTHCHECK --interval=30s --timeout=30s --retries=3 \
  CMD curl --silent --fail http://localhost:5173 || exit 1