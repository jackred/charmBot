FROM node:latest

WORKDIR /usr/src/charmBot
COPY package*.json ./
RUN npm install --only=prod
RUN npm install pm2 -g

COPY . .
CMD ["pm2-docker", "start", "process.json"]