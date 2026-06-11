import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../domain/models/user_model.dart';
import '../../domain/repositories/auth_repository.dart';
import '../states/auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit({
    required AuthRepository repository,
    required SecureStorage secureStorage,
  })  : _repository = repository,
        _secureStorage = secureStorage,
        super(const AuthInitial());

  final AuthRepository _repository;
  final SecureStorage _secureStorage;

  Future<void> checkAuthStatus() async {
    emit(const AuthLoading());
    final token = await _secureStorage.getToken();
    if (token == null || token.isEmpty) {
      emit(const AuthUnauthenticated());
      return;
    }
    try {
      final user = await _repository.getCurrentUser();
      emit(AuthAuthenticated(user));
    } on AppException catch (e) {
      if (e.statusCode == 401 || e.statusCode == 403) {
        await _secureStorage.clearAll();
      }
      emit(const AuthUnauthenticated());
    } catch (_) {
      emit(const AuthUnauthenticated());
    }
  }

  Future<void> login(String email, String password) async {
    emit(const AuthLoading());
    try {
      final result = await _repository.login(email, password);
      emit(AuthAuthenticated(result.user));
    } on AppException catch (e) {
      emit(AuthError(e.message));
    } catch (_) {
      emit(const AuthError('An unexpected error occurred.'));
    }
  }

  Future<void> register(String name, String email, String password) async {
    emit(const AuthLoading());
    try {
      final result = await _repository.register(name, email, password);
      emit(AuthAuthenticated(result.user));
    } on AppException catch (e) {
      emit(AuthError(e.message));
    } catch (_) {
      emit(const AuthError('An unexpected error occurred.'));
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    emit(const AuthUnauthenticated());
  }

  void updateUser(UserModel user) {
    emit(AuthAuthenticated(user));
  }
}
