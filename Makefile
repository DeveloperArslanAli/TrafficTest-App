# Makefile for TrafficTest Monorepo
# Run `make help` to see all targets

.PHONY: help install dev build seed migrate verify docker-up docker-down clean build-apk build-aab build-android

help:
	@echo ""
	@echo "TrafficTest — Available Commands"
	@echo "──────────────────────────────────────────────"
	@echo "  make install        Install all deps (backend + admin + mobile)"
	@echo "  make docker-up      Start postgres + redis containers"
	@echo "  make docker-down    Stop all containers"
	@echo "  make migrate        Run prisma migrations"
	@echo "  make seed           Seed database with 820-question bank"
	@echo "  make dev            Start backend + admin dev servers"
	@echo "  make verify         Run integration verification suite"
	@echo "  make build-apk      Compile and sign Universal Release APK"
	@echo "  make build-aab      Compile and sign Play Store App Bundle (AAB)"
	@echo "  make build-android  Compile and sign both APK and AAB"
	@echo "  make build          Build all Docker images"
	@echo "  make clean          Remove node_modules from all packages"
	@echo ""

install:
	cd backend && npm install
	cd admin && npm install
	cd mobile && npm install

docker-up:
	docker-compose up -d postgres redis
	@echo "⏳ Waiting for postgres to be ready..."
	@sleep 3

migrate:
	cd backend && npx prisma migrate dev --name init

seed:
	cd backend && npx ts-node prisma/seed.ts

dev:
	@echo "Starting backend and admin panel..."
	@start cmd /k "cd backend && npm run start:dev"
	@start cmd /k "cd admin && npm run dev"

verify:
	npx ts-node scripts/verify.ts

build-apk:
	node scripts/build-android.js --type apk

build-aab:
	node scripts/build-android.js --type aab

build-android:
	node scripts/build-android.js --type all

build:
	docker-compose build

docker-down:
	docker-compose down

clean:
	cd backend && rmdir /s /q node_modules 2>nul || true
	cd admin && rmdir /s /q node_modules 2>nul || true
	cd mobile && rmdir /s /q node_modules 2>nul || true
