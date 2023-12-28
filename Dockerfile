FROM node:16.17.1
COPY package.json pnpm-lock.yaml .env ./
RUN npm install -g pnpm
RUN pnpm i
COPY . .
RUN pnpm deploy:commands
RUN pnpm build
EXPOSE 8000
CMD pnpm start