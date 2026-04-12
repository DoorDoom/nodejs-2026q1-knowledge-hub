#stage 1
FROM node:25-alpine AS builder
WORKDIR /usr/app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

#stage 2
FROM node:25-alpine AS runner
WORKDIR /usr/app
COPY --from=builder /usr/app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /usr/app/dist ./dist

EXPOSE 8080
CMD ["node","dist/main.js"]