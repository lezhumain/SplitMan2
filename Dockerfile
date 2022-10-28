FROM node:16-alpine

RUN apk update
RUN apk add vim

WORKDIR /app
COPY . /app

RUN cd /app && npm i

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--configuration", "production"]

EXPOSE 4200/tcp
