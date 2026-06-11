import '../models/auth_result.dart';
import '../models/user_model.dart';

abstract class AuthRepository {
  Future<AuthResult> login(String email, String password);
  Future<AuthResult> register(String name, String email, String password);
  Future<void> logout();
  Future<UserModel> getCurrentUser();
}
