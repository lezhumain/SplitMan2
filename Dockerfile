FROM nginx:stable-alpine

RUN apk update
RUN apk add nodejs
RUN apk add npm

WORKDIR /app
COPY . /app

RUN ["npm", "install", "-g", "npm@9.3.0"]
RUN cd /app && npm i && npm run cp-libs

ARG IP
ARG API
RUN cd /app \
    && echo "API: $IP $API $(cat /app/api.tmp)" \
    && cat src/environments/environment.prod.ts \
    && sed -i.bak -e "s|PROD_IP|$IP|g" src/environments/environment.prod.ts \
#    && sed -i.bak -e "s|/api|$API|g" src/environments/environment.prod.ts
    && sed -i.bak -e "s|/api|$(cat /app/api.tmp)|g" src/environments/environment.prod.ts \
    && chmod +x ./*.sh

RUN ["npm", "run", "build:prod"]
RUN ["rm", "-rf", "/app/*"]

RUN cd /app && ls && ls dist && cp -r /app/dist/SplitMan21/* /usr/share/nginx/html/
