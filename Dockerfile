FROM node:latest

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install
RUN npm install sqlite3 --save
RUN npm install express --save
RUN npm install -g nodemon

COPY . .

EXPOSE 3000

CMD [ "nodemon", "bin/www"]