#!/bin/sh
echo AWS_ACCESS_KEY_ID=$(cat ~/.aws/credentials | sed -n -e 's/aws_access_key_id = //p') >> .env
echo AWS_SECRET_ACCESS_KEY=$(cat ~/.aws/credentials | sed -n -e 's/aws_secret_access_key = //p') >> .env