# Define Node.js version
ARG NODE_VERSION=14.16.0

# Base image
FROM node:${NODE_VERSION}-alpine as base

# Expose the port that the application listens on
EXPOSE 3000

# Set working directory
WORKDIR /usr/app

# Temporarily switch to root to install dependencies
USER root

# Copy src
COPY package.json package-lock.json /usr/app/
COPY ./src /usr/app/src
COPY ./db /usr/app/db
COPY ./prisma /usr/app/prisma

# Set permissions
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot \
    && chown -R nonroot /usr/app/ \
    && chmod -R 755 /usr/app/

# Development stage
FROM base as development
ENV NODE_ENV development
RUN npx prisma generate
RUN npm ci --include=dev
USER nonroot
CMD npm run devstart

# Production stage
FROM base as production
ENV NODE_ENV production
RUN npm ci --omit=dev
RUN npx prisma generate
USER nonroot
CMD npm run start:migrate

# Test stage
FROM base as test
ENV NODE_ENV test
COPY ./tests /usr/app/test
RUN npm ci --include=dev
USER nonroot
CMD npx prisma generate && \
    npx prisma migrate reset --skip-seed --force && \
    npm run devstart