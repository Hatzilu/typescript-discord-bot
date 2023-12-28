FROM node:16.17.1
COPY package.json /
COPY src ./src
COPY tsconfig.json /
COPY .env /
RUN npm
RUN npm deploy:commands
RUN npm build
RUN npm start
EXPOSE 8000