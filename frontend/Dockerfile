# Build stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

# Add this line to allow connections from outside the container
ENV VITE_HOST=0.0.0.0

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

# Final stage
# FROM nginx:alpine

# Copy built assets from builder
# COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# CMD ["nginx", "-g", "daemon off;"]