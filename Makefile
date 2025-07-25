.PHONY: help build up down logs clean restart

COMPOSE_FILE = docker-compose.yml
SERVICE_NAME = saude-rapida-app

help:
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build:
	docker-compose -f $(COMPOSE_FILE) build

up:
	docker-compose -f $(COMPOSE_FILE) up -d --build

dev:
	docker-compose -f $(COMPOSE_FILE) up --build

down:
	docker-compose -f $(COMPOSE_FILE) down

logs:
	docker-compose -f $(COMPOSE_FILE) logs -f $(SERVICE_NAME)

clean:
	docker-compose -f $(COMPOSE_FILE) down --volumes --remove-orphans
	docker system prune -f

restart:
	docker-compose -f $(COMPOSE_FILE) restart

status:
	docker-compose -f $(COMPOSE_FILE) ps
