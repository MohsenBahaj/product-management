import 'package:equatable/equatable.dart';
import 'user_model.dart';

class AuthResult extends Equatable {
  const AuthResult({required this.user, required this.token});

  final UserModel user;
  final String token;

  @override
  List<Object?> get props => [user, token];
}
