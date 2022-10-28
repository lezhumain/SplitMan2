FROM node:16-alpine

RUN apk update
RUN apk add vim

WORKDIR /app
COPY . /app

RUN cd /app && mvn npm ci

CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]

EXPOSE 4200/tcp
