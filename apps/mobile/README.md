# Mobile App (Flutter)

##Features

- Register / Login / Logout
- Product list with search and category filter
- Product CRUD (create, edit, delete)
- Product image upload from camera / gallery
- User profile with avatar upload
- Search history display and clear
- Offline-first considerations (cached product list)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Flutter (Dart) |
| State Management | Riverpod / Bloc (TBD) |
| HTTP | `dio` |
| Local Storage | `flutter_secure_storage` (tokens), `shared_preferences` |
| Image | `image_picker`, `cached_network_image` |
| Navigation | `go_router` |

## Environment

Create a `.env` file (or use `--dart-define`) to inject:

```
API_BASE_URL=http://10.0.2.2:3000/api   # Android emulator → host localhost
```

## Structure (Planned)

```
lib/
├── main.dart
├── app/
│   ├── router.dart
│   └── theme.dart
├── core/
│   ├── api/
│   ├── storage/
│   └── utils/
└── features/
    ├── auth/
    ├── products/
    ├── categories/
    ├── profile/
    └── search/
```
