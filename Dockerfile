# Base image
FROM node:18-alpine AS base

RUN apk add --no-cache --virtual .build-deps build-base g++ cairo-dev jpeg-dev pango-dev giflib-dev \
    && apk add --no-cache --virtual .runtime-deps cairo jpeg pango giflib

FROM base AS development

# Create app directory
WORKDIR /usr/src/app

# TODO: Frontend
COPY --chown=node:node backend/package*.json ./backend

# TODO: Frontend
# Install app dependencies
RUN npm ls -a backend && npm ci --prefix backend

# Bundle app source
COPY --chown=node:node . .

USER node

FROM base As build

WORKDIR /usr/src/app

# TODO: Frontend
COPY --chown=node:node backend/package*.json ./backend

# TODO: Frontend
COPY --chown=node:node --from=development /usr/src/app/backend/node_modules ./backend/node_modules

# TODO: Frontend
COPY --chown=node:node backend .

# TODO: Frontend
# Creates a "dist" folder with the production build
RUN npm run build

ENV NODE_ENV production

# TODO: Frontend
# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed.
# This ensures that the node_modules directory is as optimized as possible
RUN npm ci --prefix backend --only=production && npm cache clean --force

USER node

FROM base As production

# TODO: Frontend
# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/backend/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/backend/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/backend/resources ./resources

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
