# Build stage
FROM node:18.19.0-alpine3.18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with retry mechanism
RUN --mount=type=cache,target=/root/.npm \
    npm config set registry https://registry.npmjs.org/ && \
    for i in 1 2 3; do npm install && break || sleep 15; done

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]

# Final stage
# FROM nginx:alpine

# Copy built assets from builder
# COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# CMD ["nginx", "-g", "daemon off;"]