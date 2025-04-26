FROM node:23-alpine
WORKDIR /app/frontend
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]