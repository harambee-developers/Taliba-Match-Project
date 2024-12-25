FROM node:18-alpine

WORKDIR /app/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 7777

CMD ['npm', "run", "dev"]