# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Create temp directories and set permissions
RUN mkdir -p /tmp/nginx \
    && chown -R nginx:nginx /tmp/nginx \
    && chmod -R 755 /tmp/nginx

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Set permissions for the app files
RUN chown -R nginx:nginx /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port 443
EXPOSE 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]