# STAGE 1
FROM node:20-alpine3.19 as build

# Create app directory with proper permissions
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

# Copy package files and change ownership
COPY --chown=node:node package*.json ./

# Switch to the node user
USER node

# Install dependencies
RUN npm install

# Copy all other files and change ownership
COPY --chown=node:node . .

# Build the application
RUN npm run build

# STAGE 2
FROM node:20-alpine3.19 as app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create app directory with proper permissions
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

# Copy package files and change ownership
COPY --chown=node:node package*.json ./

# Switch to the node user
USER node

# Install production dependencies
RUN npm ci --only=production

# Copy built files from the build stage
COPY --from=build /home/node/app/dist ./dist

# Set environment variables and expose the port
ENV PORT 8282
EXPOSE 8282

# Use dumb-init to start the application
CMD ["dumb-init", "node", "dist/src/index.js"]