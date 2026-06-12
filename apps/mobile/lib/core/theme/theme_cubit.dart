import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ThemeCubit extends Cubit<ThemeMode> {
  ThemeCubit(this._storage) : super(ThemeMode.system);

  final FlutterSecureStorage _storage;
  static const _key = 'app_theme_mode';

  Future<void> init() async {
    final saved = await _storage.read(key: _key);
    if (saved == 'dark') {
      emit(ThemeMode.dark);
    } else if (saved == 'light') {
      emit(ThemeMode.light);
    } else {
      emit(ThemeMode.system);
    }
  }

  Future<void> setTheme(ThemeMode mode) async {
    await _storage.write(key: _key, value: mode.name);
    emit(mode);
  }
}
