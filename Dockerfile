FROM node:lts-buster

EXPOSE 6000
WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn

COPY . .

CMD [ "sh", "/app/start.sh" ]
