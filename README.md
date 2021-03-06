# Rastercar API

The worlds best car tracking api :car: :blue_car: :taxi: :bus:

## Setting up the enviroment

### Install dependencies

```bash
$ yarn
```

### Setting up the enviroment variables

`env/.example.env` contains a mock of all the enviroment variables needed to start the api, create a `.development.env` and a `.test.env` file containing the real variable on the `env` folder.

- the development env file is used whenever your app is started with **NODE_ENV=development** (ex: `yarn start:dev`)
- the test env file is used when **NODE_ENV=test**, like when running tests with `yarn test`

### Setting up the database

**Running locally:**
Just install postgres 13+ on your machine and setup the env vars on the _test_ and _development_ files as described above, check `database.config.ts` to see all the possible env variables used to setup the connection, dont forget to create the databases and install the postgis extension

```sql
-- same database names as the POSTGRES_DB env var on the .development.env and .test.env files
CREATE DATABASE dev_db;
CREATE DATABASE test_db;

-- Execute on both dbs when connected to them to install postgis
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
```

**Running on docker** :whale:

There is a docker-compose file that creates a postgis container with a persistent volume, it will also create empty _dev_ and _test_ databases according to the POSTGRES_DB env var on the env files if the postgis container contains no data

```bash
# start the db container
sudo docker-compose up

# stop the db container
sudo docker-compose down

# stop the db container and clear all data
sudo docker-compose down --volumes
```

### Synching the DB schema with migrations (recommended)

```bash
yarn mikro-orm migration:up
```

> Note that by default the mikro-orm cli will use the use the `env/.development.env` file to get the db connection config, if you wish to run the CLI using another env file just use run the cli with another NODE_ENV, for example: `NODE_ENV=my_file yarn mikro-orm...` would use the `env/.my_file.env` file to load the connection config variables

For a list of commands see: https://mikro-orm.io/docs/migrations/#using-via-cli

### Synching the DB schema without running migrations

After setting up the empty databases you can sync the DB schema with mikro-orm.

```bash
# Sync the schema on the dev DB using migrations (recommended)
yarn mikro-orm schema:update -r --drop-tables

# Sync the schema on the test DB
NODE_ENV=test yarn mikro-orm schema:update -r --drop-tables
```

---

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

---

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
