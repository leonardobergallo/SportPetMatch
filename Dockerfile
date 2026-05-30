FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3016

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma
COPY frontend/package*.json ./frontend/

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* \
  && npm install \
  && npm install --prefix backend \
  && npm install --prefix frontend

COPY . .

RUN npm run vps-build

EXPOSE 3016

CMD ["npm", "run", "vps-start"]
