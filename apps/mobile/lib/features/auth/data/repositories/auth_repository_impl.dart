import '../../../../core/network/interceptors/error_interceptor.dart';
import '../../../../core/storage/secure_storage.dart';
import '../datasources/auth_remote_data_source.dart';
import '../dtos/login_request_dto.dart';
import '../dtos/register_request_dto.dart';
import '../../domain/models/auth_result.dart';
import '../../domain/models/user_model.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.secureStorage,
  });

  final AuthRemoteDataSource remoteDataSource;
  final SecureStorage secureStorage;

  @override
  Future<AuthResult> login(String email, String password) async {
    final dto = LoginRequestDto(email: email, password: password);
    final response = await remoteDataSource.login(dto);
    final result = response.toModel();
    await secureStorage.saveToken(result.token);
    return result;
  }

  @override
  Future<AuthResult> register(String name, String email, String password) async {
    final dto = RegisterRequestDto(name: name, email: email, password: password);
    final response = await remoteDataSource.register(dto);
    final result = response.toModel();
    await secureStorage.saveToken(result.token);
    return result;
  }

  @override
  Future<void> logout() async {
    try {
      await remoteDataSource.logout();
    } on AppException {
      // best-effort — always clear local storage
    } finally {
      await secureStorage.clearAll();
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    final dto = await remoteDataSource.getCurrentUser();
    return dto.toModel();
  }
}
