# From the node enviroment create a build stage
# this build sate will just 
FROM node:14.17 as build

WORKDIR /app
COPY package.*json .
# install dependencies
RUN yarn install
# copy all files
COPY . .
# Build the app
RUN yarn run build

FROM node:14.17
# Despite the name this is not the same /app folder as above as this is a diff container
WORKDIR /app
COPY package.json .
# install dependencies
RUN yarn install --production
# copy the builded app
COPY --from=build /app/dist ./dist
# copy the env folder
COPY --from=build /app/env ./env
# start it
CMD yarn run start:prod