# Dockerfile for building and running a Node.js application with a client-side build step
FROM node:18-alpine AS builder

WORKDIR /app


COPY package*.json ./
RUN npm install


COPY . .


RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production


COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client


ENV NODE_ENV=production
ENV PORT=5000


EXPOSE 5000


CMD ["node", "dist/index.js"]
