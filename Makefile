.PHONY: help install prebuild prebuild-ios prebuild-android start dev ios android web lint lint-fix clean reset

# Default target - show help
help:
	@echo "Cron Wallet App - Available Make Commands"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install          - Install dependencies with bun"
	@echo "  make prebuild         - Run expo prebuild for native projects"
	@echo "  make prebuild-ios     - Prebuild for iOS only"
	@echo "  make prebuild-android - Prebuild for Android only"
	@echo ""
	@echo "Development:"
	@echo "  make start            - Start Expo development server"
	@echo "  make dev              - Alias for 'make start'"
	@echo "  make ios              - Run app on iOS simulator"
	@echo "  make android          - Run app on Android emulator"
	@echo "  make web              - Run app in web browser"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             - Run ESLint"
	@echo "  make lint-fix         - Run ESLint with auto-fix"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            - Clean build artifacts and caches"
	@echo "  make reset            - Reset project to fresh state"
	@echo ""

# Setup & Installation
install:
	bun install

prebuild:
	bun expo prebuild

prebuild-ios:
	bun expo prebuild --platform ios

prebuild-android:
	bun expo prebuild --platform android

# Development
start:
	bun start

dev: start

ios:
	bun run ios

android:
	bun run android

web:
	bun run web

# Code Quality
lint:
	bun run lint

lint-fix:
	bun run lint --fix

# Utilities
clean:
	@echo "Cleaning build artifacts and caches..."
	rm -rf node_modules
	rm -rf .expo
	rm -rf ios/build
	rm -rf android/build
	rm -rf android/.gradle
	@echo "Clean complete!"

reset:
	bun run reset-project
