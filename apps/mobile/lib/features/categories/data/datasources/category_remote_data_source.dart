import 'dart:io';
import 'package:dio/dio.dart';
import '../../../../core/network/interceptors/error_interceptor.dart';
import '../dtos/category_dto.dart';

abstract class CategoryRemoteDataSource {
  Future<List<CategoryDto>> getCategories();
  Future<CategoryDto> getCategoryById(String id);
  Future<CategoryDto> createCategory({
    required String name,
    String? description,
    String? imagePath,
  });
  Future<CategoryDto> updateCategory({
    required String id,
    String? name,
    String? description,
    String? imagePath,
  });
  Future<void> deleteCategory(String id);
}

class CategoryRemoteDataSourceImpl implements CategoryRemoteDataSource {
  const CategoryRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<List<CategoryDto>> getCategories() async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/categories');
      final data = res.data!['data'] as Map<String, dynamic>;
      return (data['categories'] as List<dynamic>)
          .cast<Map<String, dynamic>>()
          .map(CategoryDto.fromJson)
          .toList();
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<CategoryDto> getCategoryById(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/categories/$id');
      final data = res.data!['data'] as Map<String, dynamic>;
      return CategoryDto.fromJson(data['category'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<CategoryDto> createCategory({
    required String name,
    String? description,
    String? imagePath,
  }) async {
    try {
      final formData = await _buildFormData(
        name: name,
        description: description,
        imagePath: imagePath,
      );
      final res = await _dio.post<Map<String, dynamic>>(
        '/categories',
        data: formData,
      );
      final data = res.data!['data'] as Map<String, dynamic>;
      return CategoryDto.fromJson(data['category'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<CategoryDto> updateCategory({
    required String id,
    String? name,
    String? description,
    String? imagePath,
  }) async {
    try {
      final formData = await _buildFormData(
        name: name,
        description: description,
        imagePath: imagePath,
      );
      final res = await _dio.patch<Map<String, dynamic>>(
        '/categories/$id',
        data: formData,
      );
      final data = res.data!['data'] as Map<String, dynamic>;
      return CategoryDto.fromJson(data['category'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  @override
  Future<void> deleteCategory(String id) async {
    try {
      await _dio.delete<void>('/categories/$id');
    } on DioException catch (e) {
      throw _toAppException(e);
    }
  }

  Future<FormData> _buildFormData({
    String? name,
    String? description,
    String? imagePath,
  }) async {
    final fields = <String, dynamic>{};
    if (name != null) fields['name'] = name;
    if (description != null) fields['description'] = description;
    if (imagePath != null) {
      fields['image'] = await MultipartFile.fromFile(
        imagePath,
        filename: File(imagePath).uri.pathSegments.last,
      );
    }
    return FormData.fromMap(fields);
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
