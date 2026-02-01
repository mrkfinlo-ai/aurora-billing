# 1. Use Node.js
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy only the BACKEND package files first
# (This fixes the "Missing script" error because we grab the right file now)
COPY backend/package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the BACKEND code
COPY backend/ .

# 6. Build the app
RUN npm run build

# 7. Start the server
EXPOSE 3000
CMD ["node", "dist/main"]
