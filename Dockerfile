FROM node:alpine
COPY . /app
WORKDIR /app
RUN mkdir webdav && npm i
EXPOSE 3000
CMD [ "npm", "start" ]
