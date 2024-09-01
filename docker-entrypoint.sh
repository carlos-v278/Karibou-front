#!/bin/bash
chmod -R 755 ./
rm -Rf node_modules
rm -Rf dist
yarn install
yarn quasar build
exec apache2-foreground
