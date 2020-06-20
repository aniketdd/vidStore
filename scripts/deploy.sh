#!/bin/sh
set -e
if [ "$NODE_ENV" == "production" ] ; then
  npm run start
else
  npm run test
  npm run startdev
fi
