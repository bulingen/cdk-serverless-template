SHELL = /bin/bash

.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

api-dev:		## run api in dev mode
	cd api && yarn start:dev

build-api:
	cd api && yarn build

build-all: build-api

deploy-whats-built:
	yarn cdk deploy

check-env:
ifndef AWS_ACCESS_KEY_ID
	$(error You don't seem to have an aws-vault session. Run `ave <profile>` to get one)
endif

deploy: check-env build-all deploy-whats-built		## build and deploy
