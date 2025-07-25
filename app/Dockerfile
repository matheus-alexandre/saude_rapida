FROM node:23-bookworm

RUN apt update -y && apt upgrade -y && apt install -y \
    vim \
    yarn

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 16007

CMD ["/app/scripts/start_app.sh"]
