FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Remove test files from production image
# RUN rm -rf __tests__ load-tests

EXPOSE 5000

CMD ["node", "server.js"]