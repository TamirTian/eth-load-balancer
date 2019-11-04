FROM node:10.15-alpine as builder
RUN apk add --no-cache g++ gnupg python make git

WORKDIR /usr/src/app
COPY package.json .

RUN npm install

FROM node:10.15-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY src ./src
COPY package.json .

CMD yarn serve
