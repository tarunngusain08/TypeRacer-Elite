# Build stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including react-router-dom
RUN npm install
RUN npm install react-router-dom @types/react-router-dom

# Copy source code
COPY . .

# Add axios explicitly
RUN npm install axios @types/axios

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]

# Final stage
# FROM nginx:alpine

# Copy built assets from builder
# COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# CMD ["nginx", "-g", "daemon off;"]