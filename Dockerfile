FROM node:lts-buster

EXPOSE 6000
WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

COPY . .

CMD [ "sh", "/app/start.sh" ]
