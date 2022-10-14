FROM node:16.17.1
COPY package.json /
COPY src ./src
COPY tsconfig.json /
COPY .env /
RUN yarn
RUN yarn deploy:commands
RUN yarn dev
EXPOSE 8000