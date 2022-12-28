# Base image
FROM node:18-alpine AS base

RUN apk add --no-cache --virtual .build-deps build-base g++ cairo-dev jpeg-dev pango-dev giflib-dev \
    && apk add --no-cache --virtual .runtime-deps cairo jpeg pango giflib

FROM base AS development

# Create app directory
WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY --chown=node:node . .

USER node

FROM base As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Creates a "dist" folder with the production build
RUN npm run build

ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --only=production && npm cache clean --force

USER node

FROM base As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/resources ./resources

# Start the server using the production build
CMD [ "node", "dist/main.js" ]


