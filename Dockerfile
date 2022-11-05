FROM node:16-alpine

RUN apk update
RUN apk add vim nginx

WORKDIR /app
COPY . /app

RUN cd /app && npm i && npm run cp-libs

ARG IP
ARG API
RUN cd /app \
    && sed -i.bak -e "s|PROD_IP|$IP|g" src/environments/environment.prod.ts \
    && sed -i.bak -e "s|/api|$API|g" src/environments/environment.prod.ts \
    && cd /app && npx ng build --prod \
    && mkdir -p /etc/nginx/conf.d && mkdir -p /usr/share/nginx/html \
    && cp -r /app/dist/SplitMan21/* /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]

EXPOSE 4200/tcp
