### STAGE 1:BUILD ###
# Defining a node image to be used as giving it an alias of "build"
# Which version of Node image to use depends on project dependencies
# This is needed to build and compile our code
# while generating the docker image
FROM node:20-alpine AS build
# Create a Virtual directory inside the docker image
WORKDIR /dist/src/app
#WORKDIR /app
# Copy files to virtual directory
# COPY package.json package-lock.json ./
# Run command in Virtual directory
RUN npm cache clean --force
# Copy files from local machine to virtual directory in docker image
COPY . .

# TODO?
RUN apk --update add openssh-client
RUN apk --update add git
RUN apk add --no-cache bash

RUN ["npm", "install", "-g", "npm@latest"]

#RUN cd /app && npm i && npm run cp-libs
RUN ls | grep install

# TODO remove me  when using npm packages for splitwise repart
RUN dos2unix ./install_ssh_eky.sh \
    && chmod +x ./install_ssh_eky.sh \
    && bash ./install_ssh_eky.sh

RUN cd /dist/src/app && npm ci --force && npm run cp-libs

ARG IP
ARG API
ARG VERSION
RUN echo "API: $IP $API $(cat api.tmp)" \
    && cat src/environments/environment.prod.ts \
    && sed -i.bak -e "s|PROD_IP|$IP|g" src/environments/environment.prod.ts \
    && sed -i.bak -e "s|/api|$(cat /dist/src/app/api.tmp)|g" src/environments/environment.prod.ts \
    && sed -i.bak -E "s|(\"version\": \")[^\"]+\"|\1$VERSION\"|" package.json \
    && chmod +x ./*.sh

RUN ["npm", "run", "build:prod"]

RUN cp -r /dist/src/app/dist/SplitMan21 /tmp/
RUN rm -rf /dist/src/app/*
RUN mv /tmp/SplitMan21 /dist/src/app/

#RUN cd /dist/src/app && ls && ls dist && cp -r /dist/src/app/dist/SplitMan21/* /usr/share/nginx/html/

### STAGE 2:RUN ###
# Defining nginx image to be used
FROM nginx:stable-alpine AS ngi
# Copying compiled code and nginx config to different folder
# NOTE: This path may change according to your project's output folder
COPY --from=build /dist/src/app/SplitMan21 /usr/share/nginx/html
COPY /nginx.conf  /etc/nginx/conf.d/default.conf
# Exposing a port, here it means that inside the container
# the app will be using Port 80 while running
EXPOSE 80
