FROM node:lts-alpine3.9
EXPOSE 3000

WORKDIR /home/app

COPY package.json /home/app/
COPY package-lock.json /home/app/

RUN npm ci

COPY . /home/app
COPY .env.local /home/app/.env

RUN npm run test

CMD ./scripts/deploy.sh
