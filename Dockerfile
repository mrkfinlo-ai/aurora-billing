# 1. Base Image: Use a lightweight Node.js version
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package definitions first (for better caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the source code
COPY . .

# 6. Build the Billing Application
RUN npm run build billing

# 7. Expose the port the app runs on
EXPOSE 3000

# 8. Command to start the app in production mode
CMD ["node", "dist/apps/billing/main"]
