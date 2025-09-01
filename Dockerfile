FROM node:alpine

WORKDIR /usr/src/app
COPY . .

RUN npm i

RUN rm .env
RUN cp .env.development .env

RUN npm run build
CMD ["npm", "start"]
