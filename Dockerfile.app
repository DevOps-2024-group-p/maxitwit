# syntax=docker/dockerfile:1


ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine as base

# Expose the port that the application listens on.
EXPOSE 3000

WORKDIR /usr/src/app/src

COPY package.json /
COPY package-lock.json /
USER root
COPY ./src /src
COPY ./db /db
COPY ./prisma /

FROM base as development
ENV NODE_ENV development
RUN npx prisma generate
RUN npm ci --include=dev
USER root
COPY . .

CMD npm run devstart

FROM base as production
ENV NODE_ENV production
RUN npm ci --omit=dev
RUN npx prisma generate
CMD npm run start:migrate

FROM base as test
ENV NODE_ENV test
COPY ./tests /
RUN npm ci --include=dev
CMD npx prisma generate && \
    npx prisma migrate reset --skip-seed --force && \
    npm run devstart