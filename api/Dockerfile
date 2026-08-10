FROM node:20-alpine

# Install ffmpeg for audio extraction
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
