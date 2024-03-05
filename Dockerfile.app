# syntax=docker/dockerfile:1


ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine as base

# Expose the port that the application listens on.
EXPOSE 3000

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
FROM base as dev
ENV NODE_ENV development
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
USER root
COPY . .
RUN npx prisma generate
CMD npm run devstart

FROM base as prod
ENV NODE_ENV production
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
USER root
COPY . .
RUN npx prisma generate
CMD npm run start
