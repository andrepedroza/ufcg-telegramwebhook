FROM node:alpine
ENV TOKEN=DEFAULTTOKEN
ENV CHATID=-1
COPY . /app
WORKDIR /app
RUN npm i
RUN chmod +x ./run.sh
CMD [ "run.sh" ]
