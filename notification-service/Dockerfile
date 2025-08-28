FROM node:18-alpine

WORKDIR /app

# Enable Yarn
RUN corepack enable

# Copy package files
COPY package*.json yarn.lock* ./

# Install all dependencies (including dev dependencies for build)
RUN yarn install --frozen-lockfile || yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Remove dev dependencies after build
RUN yarn install --production --ignore-scripts --prefer-offline

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "start:prod"] 