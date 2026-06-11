import 'package:dio/dio.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';
import '../dtos/auth_response_dto.dart';
import '../dtos/login_request_dto.dart';
import '../dtos/register_request_dto.dart';
import '../dtos/user_dto.dart';

abstract class AuthRemoteDataSource {
  Future<AuthResponseDto> login(LoginRequestDto dto);
  Future<AuthResponseDto> register(RegisterRequestDto dto);
  Future<void> logout();
  Future<UserDto> getCurrentUser();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  const AuthRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<AuthResponseDto> login(LoginRequestDto dto) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: dto.toJson(),
      );
      return AuthResponseDto.fromJson(res.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<AuthResponseDto> register(RegisterRequestDto dto) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/auth/register',
        data: dto.toJson(),
      );
      return AuthResponseDto.fromJson(res.data!['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<void> logout() async {
    try {
      await _dio.post<void>('/auth/logout');
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<UserDto> getCurrentUser() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/auth/me');
      final data = res.data!['data'] as Map<String, dynamic>;
      return UserDto.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  AppException _toAppException(DioException e) {
    final err = e.error;
    return err is AppException
        ? err
        : AppException(
            message: e.message ?? 'Network error',
            statusCode: e.response?.statusCode,
          );
  }
}
