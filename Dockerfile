FROM node:20-alpine3.22
WORKDIR /app
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "start"]