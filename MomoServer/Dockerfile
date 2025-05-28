FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN apk update && apk upgrade && npm install --production

COPY . .

EXPOSE 4000

CMD ["npm", "start"]