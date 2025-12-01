# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy built output from build stage
COPY --from=build /app/dist ./dist

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=4321

# Expose the port
EXPOSE 4321

# Start the server
CMD ["node", "dist/server/entry.mjs"]
