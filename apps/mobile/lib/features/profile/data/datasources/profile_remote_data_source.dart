import 'dart:io';
import 'package:dio/dio.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';
import '../../../auth/data/dtos/user_dto.dart';

abstract class ProfileRemoteDataSource {
  Future<UserDto> getProfile();
  Future<UserDto> updateProfile({String? name});
  Future<UserDto> uploadProfileImage(String imagePath);
}

class ProfileRemoteDataSourceImpl implements ProfileRemoteDataSource {
  const ProfileRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<UserDto> getProfile() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/users/profile');
      final data = res.data!['data'] as Map<String, dynamic>;
      return UserDto.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<UserDto> updateProfile({String? name}) async {
    try {
      final body = <String, dynamic>{};
      if (name != null) body['name'] = name;
      final res = await _dio.patch<Map<String, dynamic>>('/users/profile', data: body);
      final data = res.data!['data'] as Map<String, dynamic>;
      return UserDto.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<UserDto> uploadProfileImage(String imagePath) async {
    try {
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          imagePath,
          filename: File(imagePath).uri.pathSegments.last,
        ),
      });
      final res = await _dio.post<Map<String, dynamic>>(
        '/users/profile-image',
        data: formData,
      );
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
