# Product Management Mobile App

## Required Architecture

Use Feature-First Clean Architecture.

lib/
├── core/
├── features/
├── shared/

Each feature must contain:

- data
- domain
- presentation

## State Management

Required:

- flutter_bloc
- Cubit

Do not use:

- Provider
- ChangeNotifier
- Riverpod
- GetX

## Dependency Injection

Use:

- get_it

Do not instantiate services directly inside UI.

## Networking

Use:

- Dio

Required:

- Auth Interceptor
- Error Interceptor
- Logging Interceptor

## Storage

Use:

- flutter_secure_storage

Store:

- JWT token
- User session

## Routing

Use:

- go_router

Implement:

- Auth Guard
- Protected Routes

## UI Rules

Use:

- Material 3
- Light Theme
- Dark Theme

Create reusable widgets.

Avoid duplicated UI.

## Widget Rules

No business logic inside widgets.

No API calls inside widgets.

If a widget exceeds 150 lines:

- Extract it.

If a screen exceeds 300 lines:

- Split it into smaller widgets.

## Features

Implement incrementally.

Phase 1:

- Core Architecture
- Theme
- Routing
- Dependency Injection

Phase 2:

- Authentication

Phase 3:

- Categories

Phase 4:

- Products

Phase 5:

- Profile

Do not generate the entire application at once.

Finish and wire each feature before moving to the next.

## Backend

Backend already exists.

Use repository pattern.

Flow:

UI
→ Cubit
→ Repository
→ Data Source
→ API

Never call Dio directly from UI.
