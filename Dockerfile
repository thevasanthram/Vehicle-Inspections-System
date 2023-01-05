FROM node:16-alpine

WORKDIR . /app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm install

COPY . .

EXPOSE 2000

RUN chmod +x wait-for-it.sh

