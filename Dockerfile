FROM node:alpine
ENV TOKEN=DEFAULTTOKEN
ENV CHATID=-1
COPY . /app
WORKDIR /app
RUN npm i
EXPOSE 3000
CMD [ "npm", "start" ]
