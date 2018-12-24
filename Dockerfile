FROM node:alpine
ENV TOKEN=DEFAULTTOKEN
ENV CHATID=-1
COPY . /app
WORKDIR /app
RUN npm i
RUN chmod +x ./run.sh
EXPOSE 3000
CMD [ "./run.sh" ]
