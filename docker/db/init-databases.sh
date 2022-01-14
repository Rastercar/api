#!/bin/bash

# This file aswell as all files in its folder are called whenever the postgis container
# is created and contains no data, and it just creates a empty databases for dev/testing.

# The $POSTGRES_DB env var that docker is running in
ORIGINAL_DB=$POSTGRES_DB
ORIGINAL_USER=$POSTGRES_USER

set -e
set -a
# shellcheck source=/dev/null
. ./initdb-env/.development.env
DEV_DB=$POSTGRES_DB

# shellcheck source=/dev/null
. ./initdb-env/.test.env
TEST_DB=$POSTGRES_DB
set +a

if [ -z "$DEV_DB" ]; then
   echo "env/.development.env POSTGRES_DB not set"
   exit 1
fi

if [ -z "$TEST_DB" ]; then
   echo "env/.test.env POSTGRES_DB not set"
   exit 1
fi

# Since this is being run by docker-compose we assume $POSTGRES_USER and $POSTGRES_DB is set

echo "reseting test/dev db"

# Reset the databases (the drop is safe as this file would not be executed if a db exists)
psql -v ON_ERROR_STOP=1 --username "$ORIGINAL_USER" --dbname "$ORIGINAL_DB" <<-EOSQL
   CREATE DATABASE $DEV_DB;
   CREATE DATABASE $TEST_DB;
EOSQL

echo "installing postgis on dev db"
psql -v ON_ERROR_STOP=1 --username "$ORIGINAL_USER" --dbname "$DEV_DB" <<-EOSQL
   CREATE EXTENSION postgis;
   CREATE EXTENSION postgis_topology;
EOSQL

echo "installing postgis on test db"
psql -v ON_ERROR_STOP=1 --username "$ORIGINAL_USER" --dbname "$TEST_DB" <<-EOSQL
   CREATE EXTENSION postgis;
   CREATE EXTENSION postgis_topology;
EOSQL
