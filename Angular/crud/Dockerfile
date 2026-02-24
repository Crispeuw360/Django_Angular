# syntax=docker/dockerfile:1

# Stage 1: Build the Angular application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine-slim

# Upgrade packages to fix vulnerabilities
RUN apk upgrade --no-cache

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/dist/crud/browser /usr/share/nginx/html

# Expose port 4200
EXPOSE 4200

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
