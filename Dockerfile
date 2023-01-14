FROM node:16-alpine

RUN apk update
RUN apk add vim

WORKDIR /app
COPY . /app

RUN cd /app && npm i && npm run cp-libs

ARG IP
ARG API
RUN cd /app \
    && echo "API: $IP $API $(cat /app/api.tmp)" \
    && cat src/environments/environment.prod.ts \
    && sed -i.bak -e "s|PROD_IP|$IP|g" src/environments/environment.prod.ts \
#    && sed -i.bak -e "s|/api|$API|g" src/environments/environment.prod.ts
    && sed -i.bak -e "s|/api|$(cat /app/api.tmp)|g" src/environments/environment.prod.ts

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--configuration", "production", "--live-reload", "false", "--watch", "false"]

EXPOSE 4200/tcp
