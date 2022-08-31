# Safer CSAM App

## Prerequisite

- Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- Run `aws configure` to configure AWS credentials.

## Run local server

- `yarn`
- `yarn start`
- Safer file upload url will be: `http://localhost:6000/upload`

## Run it locally on Docker

- Install Docker: https://docs.docker.com/engine/install
- Run `./pre-up.sh`
- Run `docker compose up -d`
- The container will be listening on port: `6000` , and the Safer file upload url is: `http://localhost:6000/upload`
