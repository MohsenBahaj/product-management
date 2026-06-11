import '../../domain/models/auth_result.dart';
import 'user_dto.dart';

class AuthResponseDto {
  const AuthResponseDto({required this.user, required this.token});

  final UserDto user;
  final String token;

  // Parses the `data` object: { user: {...}, token: "..." }
  factory AuthResponseDto.fromJson(Map<String, dynamic> json) =>
      AuthResponseDto(
        user: UserDto.fromJson(json['user'] as Map<String, dynamic>),
        token: json['token'] as String,
      );

  AuthResult toModel() => AuthResult(user: user.toModel(), token: token);
}
