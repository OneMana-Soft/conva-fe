include .env

build_image:
	docker build -t fe_service_conva:1.0 .

create_fe_container:
	docker compose --env-file .env --project-name conva -f docker-compose.yml up -d

stop_fe_container:
	docker compose --env-file .env --project-name conva -f docker-compose.yml down
